import asyncio
import struct
import serial_asyncio
from aiohttp import web
from datetime import datetime

UART_PORT = 'COM6' #/dev/ttyUSB0
UART_BAUDRATE = 115200
PACKET_SIZE = 64
START_SEQ = bytes([0x01, 0x02, 0x03, 0x04])

current_data = {
    'X': 0,
    'Y': 0,
    'Z': 0,
    'AX': 0,
    'AY': 0,
    'AZ': 0,
    'LX': 0,
    'LY': 0,
    'LZ': 0,
    'MX': 0,
    'MY': 0,
    'MZ': 0,
    'AMX': 0,
    'AMY': 0,
    'AMZ': 0,
    'LMX': 0,
    'LMY': 0,
    'LMZ': 0,
    'timestamp': datetime.now().isoformat()
}

def calc_crc16(data: bytes) -> int:
    crc = 0xFFFF
    for b in data:
        crc ^= b << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = (crc << 1) ^ 0x1021
            else:
                crc <<= 1
            crc &= 0xFFFF
    return crc

def decode_xyz_payload(payload: bytes, command: int) -> tuple:
    def get_signed_16bit(index):
        val = int(payload[index + 1] << 8 | payload[index])
        if val & 0x8000:
            val -= 0x10000
        return val

    x = get_signed_16bit(0)
    y = get_signed_16bit(2)
    z = get_signed_16bit(4)
    ax = get_signed_16bit(6)
    ay = get_signed_16bit(8)
    az = get_signed_16bit(10)
    lx = get_signed_16bit(12)
    ly = get_signed_16bit(14)
    lz = get_signed_16bit(16)
    mx = get_signed_16bit(18)
    my = get_signed_16bit(20)
    mz = get_signed_16bit(22)
    amx = get_signed_16bit(24)
    amy = get_signed_16bit(26)
    amz = get_signed_16bit(28)
    lmx = get_signed_16bit(30)
    lmy = get_signed_16bit(32)
    lmz = get_signed_16bit(34)

    return x, y, z, ax, ay, az, lx, ly, lz, mx, my, mz, amx, amy, amz, lmx, lmy, lmz

def build_uart_packet_xyz(command: int) -> bytes:
    DATA_PAYLOAD = 55
    RESP_OK = 0x00

    payload = bytes([0] * DATA_PAYLOAD)
    buffer_crc = bytes([command, RESP_OK, 0]) + payload
    crc_val = calc_crc16(buffer_crc)
    crc_hi = (crc_val >> 8) & 0xFF
    crc_lo = crc_val & 0xFF

    packet = struct.pack(f'>4sBBB{DATA_PAYLOAD}sBB', START_SEQ, command, RESP_OK, 0, payload, crc_hi, crc_lo)
    return packet

class UARTProtocol(asyncio.Protocol):
    def __init__(self):
        self.buffer = bytearray()
        self.transport = None
        self.connection_ready = asyncio.Event()
        self.waiting_for_packet = False
        self.expected_packet_start = None

    def connection_made(self, transport):
        self.transport = transport
        print("UART connection established")
        self.connection_ready.set()

    def data_received(self, data):
        self.buffer.extend(data)
        if len(self.buffer) < PACKET_SIZE:
            print(f"Buffer size is too small to process: {len(self.buffer)}")
        while len(self.buffer) >= PACKET_SIZE:
            if not self.waiting_for_packet:
                found = self._find_start_sequence()
                if not found:
                    break
            if self.waiting_for_packet:
                self._read_complete_packet()
                if len(self.buffer) < PACKET_SIZE:
                    break

    def _find_start_sequence(self):
        max_search = len(self.buffer) - PACKET_SIZE + 1
        if max_search < 0:
            return False  # not enough data

        for i in range(max_search):
            if self.buffer[i:i+4] == START_SEQ:
                if i + PACKET_SIZE <= len(self.buffer):
                    if i > 0:
                        print(f"Start sequence found at position {i}, clearing {i} bytes before sync")
                        del self.buffer[:i]
                    else:
                        print(f"Start sequence found at position {i}")
                    self.expected_packet_start = START_SEQ
                    self.waiting_for_packet = True
                    return True
                else:
                    # Not enough data yet
                    break

        # Если не нашли подходящего стартового пакета
        if len(self.buffer) > 2 * PACKET_SIZE:
            print(f"No valid start sequence found. Dropping 10 bytes.")
            del self.buffer[:10]
        return False

    def _read_complete_packet(self):
        global current_data

        packet = bytes(self.buffer[:PACKET_SIZE])
        if packet[:4] != self.expected_packet_start:
            self.waiting_for_packet = False
            self.expected_packet_start = None
            del self.buffer[0]
            self._find_start_sequence()
            return

        calc_crc = calc_crc16(packet[4:62])
        recv_crc = (packet[62] << 8) | packet[63]
        print(self.buffer.hex())

        if calc_crc == recv_crc:
            del self.buffer[:PACKET_SIZE]
            command = packet[4]

            if self.expected_packet_start == START_SEQ:
                x, y, z, ax, ay, az, lx, ly, lz, mx, my, mz, amx, amy, amz, lmx, lmy, lmz = decode_xyz_payload(packet[7:7 + 55], command)
                current_data.update({
                    'X': x, 'Y': y, 'Z': z,
                    'AX': ax, 'AY': ay, 'AZ': az,
                    'LX': lx, 'LY': ly, 'LZ': lz,
                    'MX': mx, 'MY': my, 'MZ': mz,
                    'AMX': amx, 'AMY': amy, 'AMZ': amz,
                    'LMX': lmx, 'LMY': lmy, 'LMZ': lmz,
                    'timestamp': datetime.now().isoformat()
                })

            self.waiting_for_packet = False
            self.expected_packet_start = None

            if len(self.buffer) > 0:
                self._find_start_sequence()
        else:
            del self.buffer[0]
            self.waiting_for_packet = False
            self.expected_packet_start = None
            self._find_start_sequence()

    def send(self, data: bytes):
        if self.transport:
            self.transport.write(data)
        else:
            print("UART transport not connected")


async def uart_reader():
    loop = asyncio.get_running_loop()
    protocol_instance = UARTProtocol()
    await serial_asyncio.create_serial_connection(loop, lambda: protocol_instance, UART_PORT, baudrate=UART_BAUDRATE)
    return protocol_instance

async def periodic_send(protocol: UARTProtocol):
    await protocol.connection_ready.wait()
    print("Starting periodic UART send")
    protocol.send(build_uart_packet_xyz(0x3A))
    await asyncio.sleep(1)
    while True:
        protocol.send(build_uart_packet_xyz(0x3B))
        await asyncio.sleep(0.1)

# HTTP сервер
async def handle_index(request):
    with open('card.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    return web.Response(text=html_content, content_type='text/html')

async def handle_data(request):
    return web.json_response(current_data)

async def main():
    app = web.Application()
    app.router.add_get('/', handle_index)
    app.router.add_get('/data', handle_data)
    app.router.add_static('/static/', 'static/', name='static')

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, 'localhost', 8080)
    await site.start()
    print("HTTP server started at http://localhost:8080")

    protocol = await uart_reader()

    await asyncio.gather(
        periodic_send(protocol),
    )

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Program interrupted by user, exiting...")
