// Глобальные переменные для данных графиков
let currentSvgData = {
  x: 0, y: 0, z: 0,
  mx: 0, my: 0, mz: 0,
  lmx: 0, lmy: 0, lmz: 0
};

// Функции для преобразования углов Эйлера в векторы ориентации
function eulerToVector(roll, pitch, yaw, length = 100) {
  // Преобразуем углы из градусов в радианы
  const r = roll * Math.PI / 180;
  const p = pitch * Math.PI / 180;
  const y = yaw * Math.PI / 180;
  
  // Вычисляем компоненты вектора
  const x = length * Math.cos(p) * Math.sin(y);
  const yComp = length * Math.sin(p);
  const z = length * Math.cos(p) * Math.cos(y);
  
  return { x: x, y: yComp, z: z };
}

function eulerToVectorX(roll, pitch, yaw, length = 100) {
  const r = roll * Math.PI / 180;
  const p = pitch * Math.PI / 180;
  const y = yaw * Math.PI / 180;
  
  const x = length * Math.cos(r) * Math.cos(y);
  const yComp = length * Math.sin(r);
  const z = length * Math.cos(r) * Math.sin(y);
  
  return { x: x, y: yComp, z: z };
}

function eulerToVectorY(roll, pitch, yaw, length = 100) {
  const r = roll * Math.PI / 180;
  const p = pitch * Math.PI / 180;
  const y = yaw * Math.PI / 180;
  
  const x = length * Math.sin(p);
  const yComp = length * Math.cos(p) * Math.cos(r);
  const z = length * Math.cos(p) * Math.sin(r);
  
  return { x: x, y: yComp, z: z };
}

// Функции для отрисовки SVG графиков с ориентацией по данным X, Y, Z
function renderSvgGraph1() {
  const group = document.getElementById('linesGroup');
  group.innerHTML = '';
  
  const data = currentSvgData;
  const centerX = 0, centerY = 0;
  const scale = 2; // Масштабный коэффициент
  
  // Создаем векторы ориентации на основе данных X, Y, Z
  const vectors = [
    { 
      vector: eulerToVector(data.x, data.y, data.z, 150 * scale),
      color: '#ff0000',
      label: 'X'
    },
    { 
      vector: eulerToVectorX(data.x, data.y, data.z, 120 * scale),
      color: '#00ff00',
      label: 'Y'
    },
    { 
      vector: eulerToVectorY(data.x, data.y, data.z, 100 * scale),
      color: '#0000ff',
      label: 'Z'
    }
  ];
  
  // Отрисовываем оси координат
  const axes = [
    { start: {x: centerX - 200, y: centerY, z: 0}, end: {x: centerX + 200, y: centerY, z: 0}, color: '#666666', label: 'X' },
    { start: {x: centerX, y: centerY - 150, z: 0}, end: {x: centerX, y: centerY + 150, z: 0}, color: '#666666', label: 'Y' },
    { start: {x: centerX, y: centerY, z: -150}, end: {x: centerX, y: centerY, z: 150}, color: '#666666', label: 'Z' }
  ];
  
  // Рисуем оси координат
  axes.forEach(axis => {
    const start = projectLinePoint(axis.start);
    const end = projectLinePoint(axis.end);
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('stroke', axis.color);
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-dasharray', '5,5');
    path.setAttribute('d', `M${start.cx} ${start.cy} L${end.cx} ${end.cy}`);
    group.appendChild(path);
    
    // Подписи осей
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute('x', end.cx + 10);
    label.setAttribute('y', end.cy);
    label.setAttribute('fill', axis.color);
    label.setAttribute('font-size', '16');
    label.setAttribute('font-weight', 'bold');
    label.textContent = axis.label;
    group.appendChild(label);
  });
  
  // Рисуем векторы ориентации
  vectors.forEach(vec => {
    const start = {x: centerX, y: centerY, z: 0};
    const end = {
      x: centerX + vec.vector.x,
      y: centerY + vec.vector.y, 
      z: vec.vector.z
    };
    
    const startProj = projectLinePoint(start);
    const endProj = projectLinePoint(end);
    
    // Линия вектора
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('stroke', vec.color);
    path.setAttribute('stroke-width', '4');
    path.setAttribute('d', `M${startProj.cx} ${startProj.cy} L${endProj.cx} ${endProj.cy}`);
    group.appendChild(path);
    
    // Стрелка на конце вектора
    const arrowLength = 15;
    const angle = Math.atan2(endProj.cy - startProj.cy, endProj.cx - startProj.cx);
    
    const arrow1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow1.setAttribute('stroke', vec.color);
    arrow1.setAttribute('stroke-width', '3');
    arrow1.setAttribute('d', `M${endProj.cx} ${endProj.cy} L${endProj.cx - arrowLength * Math.cos(angle - Math.PI/6)} ${endProj.cy - arrowLength * Math.sin(angle - Math.PI/6)}`);
    group.appendChild(arrow1);
    
    const arrow2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow2.setAttribute('stroke', vec.color);
    arrow2.setAttribute('stroke-width', '3');
    arrow2.setAttribute('d', `M${endProj.cx} ${endProj.cy} L${endProj.cx - arrowLength * Math.cos(angle + Math.PI/6)} ${endProj.cy - arrowLength * Math.sin(angle + Math.PI/6)}`);
    group.appendChild(arrow2);
    
    // Подпись вектора
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute('x', endProj.cx + 15);
    label.setAttribute('y', endProj.cy);
    label.setAttribute('fill', vec.color);
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', 'bold');
    label.textContent = ``;
    group.appendChild(label);
  });
  
  // Отображаем текущие значения
  const infoText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  infoText.setAttribute('x', 0);
  infoText.setAttribute('y', 50);
  infoText.setAttribute('fill', '#ffffff');
  infoText.setAttribute('font-size', '30');
  infoText.setAttribute('font-weight', 'bold');
  infoText.textContent = ` X=${Math.round(data.x)}°, Y=${Math.round(data.y)}°, Z=${Math.round(data.z)}°`;
  group.appendChild(infoText);
}

function renderSvgGraph2() {
  const group = document.getElementById('linesGroupOnly1');
  group.innerHTML = '';
  
  const data = currentSvgData;
  const centerX = 0, centerY = 0;
  const scale = 1; // Меньший масштаб для больших значений
  
  // Создаем векторы для MX, MY, MZ
  const vectors = [
    { 
      vector: eulerToVector(data.mx, data.my, data.mz, 150 * scale),
      color: '#ff0000',
      label: 'MX'
    },
    { 
      vector: eulerToVectorX(data.mx, data.my, data.mz, 120 * scale),
      color: '#00ff00',
      label: 'MY'
    },
    { 
      vector: eulerToVectorY(data.mx, data.my, data.mz, 100 * scale),
      color: '#0000ff',
      label: 'MZ'
    }
  ];
  
  // Оси координат
  const axes = [
    { start: {x: centerX - 200, y: centerY, z: 0}, end: {x: centerX + 200, y: centerY, z: 0}, color: '#666666', label: 'X' },
    { start: {x: centerX, y: centerY - 150, z: 0}, end: {x: centerX, y: centerY + 150, z: 0}, color: '#666666', label: 'Y' },
    { start: {x: centerX, y: centerY, z: -150}, end: {x: centerX, y: centerY, z: 150}, color: '#666666', label: 'Z' }
  ];
  
  // Рисуем оси
  axes.forEach(axis => {
    const start = projectLinePoint(axis.start);
    const end = projectLinePoint(axis.end);
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('stroke', axis.color);
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-dasharray', '5,5');
    path.setAttribute('d', `M${start.cx} ${start.cy} L${end.cx} ${end.cy}`);
    group.appendChild(path);
    
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute('x', end.cx + 10);
    label.setAttribute('y', end.cy);
    label.setAttribute('fill', axis.color);
    label.setAttribute('font-size', '16');
    label.setAttribute('font-weight', 'bold');
    label.textContent = axis.label;
    group.appendChild(label);
  });
  
  // Рисуем векторы
  vectors.forEach(vec => {
    const start = {x: centerX, y: centerY, z: 0};
    const end = {
      x: centerX + vec.vector.x,
      y: centerY + vec.vector.y, 
      z: vec.vector.z
    };
    
    const startProj = projectLinePoint(start);
    const endProj = projectLinePoint(end);
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('stroke', vec.color);
    path.setAttribute('stroke-width', '4');
    path.setAttribute('d', `M${startProj.cx} ${startProj.cy} L${endProj.cx} ${endProj.cy}`);
    group.appendChild(path);
    
    // Стрелка
    const arrowLength = 15;
    const angle = Math.atan2(endProj.cy - startProj.cy, endProj.cx - startProj.cx);
    
    const arrow1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow1.setAttribute('stroke', vec.color);
    arrow1.setAttribute('stroke-width', '3');
    arrow1.setAttribute('d', `M${endProj.cx} ${endProj.cy} L${endProj.cx - arrowLength * Math.cos(angle - Math.PI/6)} ${endProj.cy - arrowLength * Math.sin(angle - Math.PI/6)}`);
    group.appendChild(arrow1);
    
    const arrow2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow2.setAttribute('stroke', vec.color);
    arrow2.setAttribute('stroke-width', '3');
    arrow2.setAttribute('d', `M${endProj.cx} ${endProj.cy} L${endProj.cx - arrowLength * Math.cos(angle + Math.PI/6)} ${endProj.cy - arrowLength * Math.sin(angle + Math.PI/6)}`);
    group.appendChild(arrow2);
    
    // Подпись
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute('x', endProj.cx + 15);
    label.setAttribute('y', endProj.cy);
    label.setAttribute('fill', vec.color);
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', 'bold');
    label.textContent = ``;
    group.appendChild(label);
  });
  
  // Информация
  const infoText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  infoText.setAttribute('x', 0);
  infoText.setAttribute('y', 50);
  infoText.setAttribute('fill', '#ffffff');
  infoText.setAttribute('font-size', '30');
  infoText.setAttribute('font-weight', 'bold');
  infoText.textContent = `MX=${Math.round(data.mx)}, MY=${Math.round(data.my)}, MZ=${Math.round(data.mz)}`;
  group.appendChild(infoText);
}

function renderSvgGraph3() {
  const group = document.getElementById('linesGroupOnly2');
  group.innerHTML = '';
  
  const data = currentSvgData;
  const centerX = 0, centerY = 0;
  const scale = 2; // Масштаб для линейных ускорений
  
  // Создаем векторы для LMX, LMY, LMZ
  const vectors = [
    { 
      vector: eulerToVector(data.lmx, data.lmy, data.lmz, 150 * scale),
      color: '#ff8800',
      label: 'LMXYZ'
    },
    { 
      vector: eulerToVectorX(data.lmx, data.lmy, data.lmz, 120 * scale),
      color: '#88ff00',
      label: 'LMX-ось'
    },
    { 
      vector: eulerToVectorY(data.lmx, data.lmy, data.lmz, 100 * scale),
      color: '#0088ff',
      label: 'LMY-ось'
    }
  ];
  
  // Оси координат
  const axes = [
    { start: {x: centerX - 200, y: centerY, z: 0}, end: {x: centerX + 200, y: centerY, z: 0}, color: '#666666', label: 'X' },
    { start: {x: centerX, y: centerY - 150, z: 0}, end: {x: centerX, y: centerY + 150, z: 0}, color: '#666666', label: 'Y' },
    { start: {x: centerX, y: centerY, z: -150}, end: {x: centerX, y: centerY, z: 150}, color: '#666666', label: 'Z' }
  ];
  
  // Рисуем оси
  axes.forEach(axis => {
    const start = projectLinePoint(axis.start);
    const end = projectLinePoint(axis.end);
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('stroke', axis.color);
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-dasharray', '5,5');
    path.setAttribute('d', `M${start.cx} ${start.cy} L${end.cx} ${end.cy}`);
    group.appendChild(path);
    
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute('x', end.cx + 10);
    label.setAttribute('y', end.cy);
    label.setAttribute('fill', axis.color);
    label.setAttribute('font-size', '16');
    label.setAttribute('font-weight', 'bold');
    label.textContent = axis.label;
    group.appendChild(label);
  });
  
  // Рисуем векторы
  vectors.forEach(vec => {
    const start = {x: centerX, y: centerY, z: 0};
    const end = {
      x: centerX + vec.vector.x,
      y: centerY + vec.vector.y, 
      z: vec.vector.z
    };
    
    const startProj = projectLinePoint(start);
    const endProj = projectLinePoint(end);
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('stroke', vec.color);
    path.setAttribute('stroke-width', '4');
    path.setAttribute('d', `M${startProj.cx} ${startProj.cy} L${endProj.cx} ${endProj.cy}`);
    group.appendChild(path);
    
    // Стрелка
    const arrowLength = 15;
    const angle = Math.atan2(endProj.cy - startProj.cy, endProj.cx - startProj.cx);
    
    const arrow1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow1.setAttribute('stroke', vec.color);
    arrow1.setAttribute('stroke-width', '3');
    arrow1.setAttribute('d', `M${endProj.cx} ${endProj.cy} L${endProj.cx - arrowLength * Math.cos(angle - Math.PI/6)} ${endProj.cy - arrowLength * Math.sin(angle - Math.PI/6)}`);
    group.appendChild(arrow1);
    
    const arrow2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow2.setAttribute('stroke', vec.color);
    arrow2.setAttribute('stroke-width', '3');
    arrow2.setAttribute('d', `M${endProj.cx} ${endProj.cy} L${endProj.cx - arrowLength * Math.cos(angle + Math.PI/6)} ${endProj.cy - arrowLength * Math.sin(angle + Math.PI/6)}`);
    group.appendChild(arrow2);
    
    // Подпись
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute('x', endProj.cx + 15);
    label.setAttribute('y', endProj.cy);
    label.setAttribute('fill', vec.color);
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', 'bold');
    label.textContent = ``;
    group.appendChild(label);
  });
  
  // Информация
  const infoText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  infoText.setAttribute('x', 0);
  infoText.setAttribute('y', 50);
  infoText.setAttribute('fill', '#ffffff');
  infoText.setAttribute('font-size', '30');
  infoText.setAttribute('font-weight', 'bold');
  infoText.textContent = `LMX=${Math.round(data.lmx)}, LMY=${Math.round(data.lmy)}, LMZ=${Math.round(data.lmz)}`;
  group.appendChild(infoText);
}

// Функция для проекции 3D точки в 2D
let cos = Math.cos, sin = Math.sin, xyz = 'xyz'.split(''),
    k = 500, a1 = 0, a2 = 0, far = 300, p,
    w = 800, h = 600;

function projectLinePoint(p) {
  let x = p.x*cos(a1) + p.z*sin(a1);
  let z = p.z*cos(a1) - p.x*sin(a1);
  let y = (p.y??0)*cos(a2) +   z*sin(a2);
  let d =   z*cos(a2) - (p.y??0)*sin(a2) + far;
  return {
    cx: (k/d)*x + w/2,
    cy: (k/d)*y + h/2
  };
}

// Функция для обновления всех SVG графиков
function renderAllSvgGraphs() {
  renderSvgGraph1();
  renderSvgGraph2();
  renderSvgGraph3();
}

// Обработчики событий для вращения
let evt = (t, f) => addEventListener(t, e => {
  if (f) f(e);
  renderAllSvgGraphs();
});

// Инициализация SVG графиков
renderAllSvgGraphs();

// Остальной код без изменений (гейджи, графики и т.д.)
class SvgGauge {
  constructor(container, options) {
    this.fullCircle = options.fullCircle ?? false;
    this.container = container;
    this.minValue = options.minValue ?? 0;
    this.maxValue = options.maxValue ?? 100;
    this.unit = options.unit ?? '';
    this.title = options.title ?? 'Gauge';
    this.tickCount = options.tickCount ?? 10;
    this.dangerThreshold = options.dangerThreshold ?? this.maxValue * 0.85;
    this.warningThreshold = options.warningThreshold ?? this.maxValue * 0.7;
    this.colors = options.colors ?? {
      primary: '#448aff',
      danger: '#ff5252',
      warning: '#ffb142',
      success: '#4caf50',
      text: '#e0f7fa'
    };
    this.value = this.minValue;
    this.id = options.id ?? 'gauge';

    this._createGauge();
  }
  
  _createGauge() {
    this.container.innerHTML = `
      <div class="gauge-container" id="${this.id}">
        <div class="gauge-title">
          <svg class="gauge-icon" viewBox="0 0 24 24">${this._getIconPath()}</svg>
          <h2>${this.title}</h2>
        </div>
        <svg class="gauge-svg" viewBox="0 0 280 280" aria-label="${this.title}" role="img">
          <circle cx="140" cy="140" r="130" fill="url(#bgGradient)" filter="url(#shadow)" />
          <path class="zone-normal" />
          <path class="zone-warning" />
          <path class="zone-danger" />
          <g class="ticks"></g>
          <line class="needle" x1="140" y1="140" x2="140" y2="15" />
          <circle cx="140" cy="140" r="15" fill="url(#centerGradient)" stroke="#e0e0e0" stroke-width="1"/>
          <circle cx="140" cy="140" r="6" fill="#212121" />
          <text class="value-display" x="140" y="190" text-anchor="middle" fill="${this.colors.text}" font-size="32" font-weight="700" font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" style="filter: drop-shadow(0 0 4px #448aff); user-select:none;"></text>
          <text class="unit-display" x="140" y="215" text-anchor="middle" fill="${this.colors.text}" font-size="18" font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" opacity="0.7">${this.unit}</text>
          <text class="min-label" x="45" y="245" fill="#b2ebf2" font-size="14">${this.minValue}</text>

        </svg>
        <div class="min-max">
          <span>MIN: ${this.minValue}</span>
          <span>MAX: ${this.maxValue}</span>
        </div>
        <div class="status"><span class="led"></span><span class="status-text">ОЖИДАНИЕ ДАННЫХ</span></div>
      </div>
    `;

    const svgElem = this.container.querySelector('svg.gauge-svg');
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#2c3b61"/>
        <stop offset="100%" stop-color="#1a243a"/>
      </radialGradient>
      <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f5f5f5"/>
        <stop offset="100%" stop-color="#9e9e9e"/>
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%" >
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.7"/>
      </filter>
    `;
    svgElem.prepend(defs);

    this.svg = svgElem;
    this.needle = this.svg.querySelector('.needle');
    this.valueText = this.svg.querySelector('.value-display');
    this.statusText = this.container.querySelector('.status-text');
    this.statusLed = this.container.querySelector('.led');
    this.zonesNormal = this.svg.querySelector('.zone-normal');
    this.zonesWarning = this.svg.querySelector('.zone-warning');
    this.zonesDanger = this.svg.querySelector('.zone-danger');
    this.ticksGroup = this.svg.querySelector('.ticks');

    this._drawZones();
    this._drawTicks(); 
    this._updateNeedle(this.value);
  }

  _drawZones() {
    const totalAngle = this.fullCircle ? 360 : 270;
    const startAngle = this.fullCircle ? 0 : 135;
    const range = this.maxValue - this.minValue;

    const polarToCartesian = (cx, cy, radius, angleDegrees) => {
      const angleRadians = (angleDegrees - 90) * Math.PI / 180.0;
      return {
        x: cx + radius * Math.cos(angleRadians),
        y: cy + radius * Math.sin(angleRadians)
      };
    };

    const arcPath = (startAng, endAng, radius) => {
      const start = polarToCartesian(140, 140, radius, endAng);
      const end = polarToCartesian(140, 140, radius, startAng);
      const largeArcFlag = (endAng - startAng) <= 180 ? 0 : 1;
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    };

    const dangerStartAng = startAngle + totalAngle * ((this.dangerThreshold - this.minValue) / range);
    const warningStartAng = startAngle + totalAngle * ((this.warningThreshold - this.minValue) / range);
    const endAng = startAngle + totalAngle;

    const radius = 120;

    this.zonesNormal.setAttribute('d', arcPath(startAngle, warningStartAng, radius));
    this.zonesWarning.setAttribute('d', arcPath(warningStartAng, dangerStartAng, radius));
    this.zonesDanger.setAttribute('d', arcPath(dangerStartAng, endAng, radius));
  }

  _drawTicks() {
    this.ticksGroup.innerHTML = '';
    const totalAngle = this.fullCircle ? 360 : 270;
    const startAngle = this.fullCircle ? 0 : 135;
    const minorTickLength = 8;
    const majorTickLength = 16;
    const ticksCount = this.tickCount;
    const range = this.maxValue - this.minValue;

    for (let i = 0; i <= ticksCount; i++) {
      const angle = startAngle + (totalAngle / ticksCount) * i;
      const largeTick = (i % 2 === 0);
      const tickLength = largeTick ? majorTickLength : minorTickLength;

      const outer = this._polarToCartesian(140, 140, 130, angle);
      const inner = this._polarToCartesian(140, 140, 130 - tickLength, angle);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute('x1', outer.x);
      line.setAttribute('y1', outer.y);
      line.setAttribute('x2', inner.x);
      line.setAttribute('y2', inner.y);
      line.setAttribute('stroke', '#a0bfff');
      line.setAttribute('stroke-width', largeTick ? '3' : '1.5');
      line.setAttribute('stroke-linecap', 'round');
      this.ticksGroup.appendChild(line);

      if (largeTick) {
        const labelPos = this._polarToCartesian(140, 140, 100, angle);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute('x', labelPos.x);
        text.setAttribute('y', labelPos.y + 6);
        text.setAttribute('fill', '#c2d1ff');
        text.setAttribute('font-size', '14');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-weight', '600');
        text.setAttribute('font-family', "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");

        let displayVal;
        if(this.fullCircle) {
          if(i === 0) displayVal = '0';
          else if(i === ticksCount) displayVal = '360';
          else displayVal = Math.round(this.minValue + (range / ticksCount) * i);
        } else {
          if (this.maxValue > 1000)
            displayVal = Math.round(this.minValue + (range / ticksCount) * i / 1000) + 'k';
          else
            displayVal = Math.round(this.minValue + (range / ticksCount) * i);
        }

        text.textContent = displayVal;
        this.ticksGroup.appendChild(text);
      }
    }
  }

  _polarToCartesian(cx, cy, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + (radius * Math.cos(angleInRadians)),
      y: cy + (radius * Math.sin(angleInRadians))
    };
  }

  _updateNeedle(value) {
    if (value < this.minValue) value = this.minValue;
    if (value > this.maxValue) value = this.maxValue;
    this.value = value;
    const range = this.maxValue - this.minValue;
    const totalAngle = this.fullCircle ? 360 : 270;
    const startAngle = this.fullCircle ? 0 : 135;

    const angle = startAngle + (value - this.minValue) / range * totalAngle;
    this.needle.style.transform = `rotate(${angle}deg)`;

    this.valueText.textContent = Math.round(value).toLocaleString();
    if (value >= this.dangerThreshold) {
      this.valueText.style.fill = this.colors.danger;
      this.valueText.style.filter = `drop-shadow(0 0 7px ${this.colors.danger})`;
      this.statusLed.style.backgroundColor = this.colors.danger;
      this.statusLed.style.boxShadow = `0 0 7px ${this.colors.danger}`;
      this.statusText.textContent = 'ОПАСНЫЙ РЕЖИМ';
    } else if (value >= this.warningThreshold) {
      this.valueText.style.fill = this.colors.warning;
      this.valueText.style.filter = `drop-shadow(0 0 7px ${this.colors.warning})`;
      this.statusLed.style.backgroundColor = this.colors.warning;
      this.statusLed.style.boxShadow = `0 0 7px ${this.colors.warning}`;
      this.statusText.textContent = 'ВЫСОКАЯ НАГРУЗКА';
    } else {
      this.valueText.style.fill = this.colors.text;
      this.valueText.style.filter = `drop-shadow(0 0 7px ${this.colors.primary})`;
      this.statusLed.style.backgroundColor = '#4caf50';
      this.statusLed.style.boxShadow = `0 0 7px #4caf50`;
      this.statusText.textContent = 'НОРМАЛЬНЫЙ РЕЖИМ';
    }
  }

  setValue(value) {
    this._updateNeedle(value);
  }

  _getIconPath() {
    return this.iconPath ?? `<path d="M13,2.05V5.08C16.39,5.57 19,8.47 19,12C19,12.9 18.82,13.75 18.5,14.54L21.12,16.07C21.68,14.83 22,13.45 22,12C22,6.82 18.05,2.55 13,2.05M12,19A7,7 0 0,1 5,12C5,8.47 7.61,5.57 11,5.08V2.05C5.94,2.55 2,6.81 2,12A10,10 0 0,0 12,22C15.3,22 18.23,20.39 20.05,17.91L17.45,16.38C16.17,18 14.21,19 12,19Z" />`;
  }
}

const icons = {
  rpm: `<path d="M13,2.05V5.08C16.39,5.57 19,8.47 19,12C19,12.9 18.82,13.75 18.5,14.54L21.12,16.07C21.68,14.83 22,13.45 22,12C22,6.82 18.05,2.55 13,2.05M12,19A7,7 0 0,1 5,12C5,8.47 7.61,5.57 11,5.08V2.05C5.94,2.55 2,6.81 2,12A10,10 0 0,0 12,22C15.3,22 18.23,20.39 20.05,17.91L17.45,16.38C16.17,18 14.21,19 12,19Z" />`,
  temperature: `<path d="M7 11a5 5 0 1 1 6 0v6a2 2 0 1 1-6 0v-6z" />`,
  thrust: `<path d="M12 2L15 8h-6l3-6zm0 20c-4.41 0-8-1.79-8-4v-3h16v3c0 2.21-3.59 4-8 4z" />`
};

function createGaugeWithIcon(containerId, options) {
  options.id = containerId;
  options.iconPath = options.iconPath || icons.rpm;
  const container = document.createElement('div');
  document.getElementById('dashboard').appendChild(container);
  return new SvgGauge(container, options);
}

class MultiParameterChart {
    constructor(canvasId, params, colors, maxDataPoints = 200, legendId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.params = params;
        this.colors = colors;
        this.maxDataPoints = maxDataPoints;
        this.dataHistory = {};
        
        this.legendId = legendId;
        
        this.params.forEach(param => { 
            this.dataHistory[param] = []; 
        });

        this.initChart();
        this.createLegend();
    }

    initChart() {
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.draw();
        });
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth * devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    createLegend() {
        const legendContainer = document.getElementById(this.legendId);
        legendContainer.innerHTML = '';
        this.params.forEach(param => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${this.colors[param]}"></div>
                <span>${param}</span>
            `;
            legendContainer.appendChild(legendItem);
        });
    }

    addData(data) {
        this.params.forEach(param => {
            if(data[param] !== undefined){
                this.dataHistory[param].push(data[param]);
                if(this.dataHistory[param].length > this.maxDataPoints){
                    this.dataHistory[param].shift();
                }
            }
        });
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(26, 36, 58, 0.7)';
        ctx.fillRect(0, 0, width, height);

        this.drawGrid();

        this.params.forEach(param => {
            if(this.dataHistory[param].length > 1){
                this.drawLine(this.dataHistory[param], this.colors[param]);
            }
        });
    }

    drawGrid() {
        const ctx = this.ctx;
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Вертикальные линии (время)
        for(let i = 0; i <= 10; i++){
            ctx.beginPath();
            ctx.moveTo(i * width / 10, 0);
            ctx.lineTo(i * width / 10, height);
            ctx.stroke();
        }
        
        // Горизонтальные линии (значения)
        for(let i = 0; i <= 5; i++){
            ctx.beginPath();
            ctx.moveTo(0, i * height / 5);
            ctx.lineTo(width, i * height / 5);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px "Segoe UI"';
        
        // Подписи времени
        for(let i = 0; i <= 10; i++){
            const timeLabel = `${-i * this.maxDataPoints / 10 / 10}s`;
            ctx.fillText(timeLabel, i * width / 10, height - 5);
        }
        
        // Подписи значений - теперь динамические
        ctx.textAlign = 'right';
        
        // Вычисляем глобальный диапазон данных для всех параметров
        let allValues = [];
        this.params.forEach(param => {
            allValues = allValues.concat(this.dataHistory[param]);
        });
        
        const globalMin = allValues.length > 0 ? Math.min(...allValues) : 0;
        const globalMax = allValues.length > 0 ? Math.max(...allValues) : 100;
        const range = globalMax - globalMin || 1; // Защита от деления на ноль

        // Отрисовываем значения на оси Y
        for(let i = 0; i <= 5; i++){
            const value = globalMax - i * (range / 5);
            const y = i * height / 5 + 15;
            ctx.fillText(value.toFixed(1), 40, y);
        }
        
        ctx.textAlign = 'left';
    }

    drawLine(data, color) {
        const ctx = this.ctx;
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;

        // Вычисляем диапазон для конкретного набора данных
        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);
        const range = maxVal - minVal || 1; // Защита от деления на ноль

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';

        data.forEach((value, index) => {
            const x = (index / (this.maxDataPoints - 1)) * width;
            const y = height - ((value - minVal) / range) * height * 0.9 - height * 0.05;

            if(index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
        
        // ТОЧКИ УБРАНЫ - отображается только линия
    }
}

// Создаем гейджи
const X = createGaugeWithIcon('X', {
  minValue: 0, maxValue: 360, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: 0,
  colors: { primary:'#448aff', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'X',
  iconPath: icons.temperature, 
  fullCircle: true,
});
const Y = createGaugeWithIcon('Y', {
  minValue: 0, maxValue: 360, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: 0,
  colors: { primary:'#00bcd4', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Y',
  iconPath: icons.temperature,
  fullCircle: true,
});
const Z = createGaugeWithIcon('Z', {
  minValue: 0, maxValue: 360, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: 0,
  colors: { primary:'#ff4081', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Z',
  iconPath: icons.thrust,
  fullCircle: true,
});
const AX = createGaugeWithIcon('AX', {
  minValue: -10000, maxValue: 10000, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: -150,
  colors: { primary:'#448aff', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Акселерометр X',
  iconPath: icons.temperature
});
const AY = createGaugeWithIcon('AY', {
  minValue: -10000, maxValue: 10000, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: -150,
  colors: { primary:'#00bcd4', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Акселерометр Y',
  iconPath: icons.temperature
});
const AZ = createGaugeWithIcon('AZ', {
  minValue: -10000, maxValue: 10000, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: -150,
  colors: { primary:'#ff4081', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Акселерометр Z',
  iconPath: icons.thrust
});

const X1 = createGaugeWithIcon('MX', {
  minValue: 0, maxValue: 360, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: 0,
  colors: { primary:'#448aff', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'X1',
  iconPath: icons.temperature, 
  fullCircle: true,
});
const Y1 = createGaugeWithIcon('MY', {
  minValue: 0, maxValue: 360, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: 0,
  colors: { primary:'#00bcd4', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Y1',
  iconPath: icons.temperature,
  fullCircle: true,
});
const Z1 = createGaugeWithIcon('MZ', {
  minValue: 0, maxValue: 360, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: 0,
  colors: { primary:'#ff4081', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Z1',
  iconPath: icons.thrust,
  fullCircle: true,
});
const AX1 = createGaugeWithIcon('AMX', {
  minValue: -10000, maxValue: 10000, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: -150,
  colors: { primary:'#448aff', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Акселерометр X1',
  iconPath: icons.temperature
});
const AY1 = createGaugeWithIcon('AMY', {
  minValue: -10000, maxValue: 10000, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: -150,
  colors: { primary:'#00bcd4', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Акселерометр Y1',
  iconPath: icons.temperature
});
const AZ1 = createGaugeWithIcon('AMZ', {
  minValue: -10000, maxValue: 10000, unit: '°', tickCount: 10,
  dangerThreshold: 0, warningThreshold: -150,
  colors: { primary:'#ff4081', danger:'#ff5252', warning:'#ffb142', success:'#4caf50', text:'#e0f7fa' },
  title: 'Акселерометр Z1',
  iconPath: icons.thrust
});

// Создаем три графика по группам параметров с динамическими осями
const chartXYZ = new MultiParameterChart('chartXYZ', ['X', 'Y', 'Z', 'MX', 'MY', 'MZ'], {
  X: '#448aff', Y: '#00bcd4', Z: '#ff4081', MX: '#008000', MY: '#8b00ff', MZ: '#ffff00'
}, 200, 'legendXYZ');

const chartAXYZ = new MultiParameterChart('chartAXYZ', ['AX', 'AY', 'AZ', 'AMX', 'AMY', 'AMZ'], {
  AX: '#ff9800', AY: '#4caf50', AZ: '#9c27b0', AMX: '#008000', AMY: '#8b00ff', AMZ: '#ffff00'
}, 200, 'legendAXYZ');

// Обновление данных с сервера
async function updateData() {
  try {
    const response = await fetch('/data');
    if (!response.ok) throw new Error('Network error');

    const data = await response.json();

    // Обновляем данные для SVG графиков
    currentSvgData.x = data.X || 0;
    currentSvgData.y = data.Y || 0;
    currentSvgData.z = data.Z || 0;
    currentSvgData.mx = data.MX || 0;
    currentSvgData.my = data.MY || 0;
    currentSvgData.mz = data.MZ || 0;
    currentSvgData.lmx = data.LMX || 0;
    currentSvgData.lmy = data.LMY || 0;
    currentSvgData.lmz = data.LMZ || 0;

    // Обновляем SVG графики
    renderAllSvgGraphs();

    // Обновляем гейджи исходными значениями
    X.setValue(data.X);
    Y.setValue(data.Y);
    Z.setValue(data.Z);
    AX.setValue(data.AX);
    AY.setValue(data.AY);
    AZ.setValue(data.AZ);

    X1.setValue(data.MX);
    Y1.setValue(data.MY);
    Z1.setValue(data.MZ);
    AX1.setValue(data.AMX);
    AY1.setValue(data.AMY);
    AZ1.setValue(data.AMZ);

    // Создаем копии данных с масштабированием для графиков
    const scaledDataAccel = {
      ...data,
      AX: data.AX / 1000,
      AY: data.AY / 1000,
      AZ: data.AZ / 1000
    };

    // Обновляем графики с соответствующими данными
    chartXYZ.addData(data); // Исходные значения для X, Y, Z
    chartAXYZ.addData(scaledDataAccel); // Масштабированные значения акселерометра

    document.getElementById('connectionStatus').className = 'connection-status connected';

  } catch (error) {
    console.error('Error fetching data:', error);
    document.getElementById('connectionStatus').className = 'connection-status disconnected';
  }
}

setInterval(updateData, 100);
updateData();