/**
 * SHADER ENGINE - PRISM CORE
 * Motor de renderizado WebGL para fondo dinámico
 */

const initShaderEngine = () => {
    const canvas = document.getElementById('canvas-shader');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // 1. Ajuste de resolución y canvas
    function resizeCanvas() {
        const ratio = window.innerWidth < 768 ? 0.5 : 1; // Optimización para móviles
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 2. Funciones de compilación
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    // 3. Inicialización de Shaders (Lectura desde el DOM)
    const vertexShaderSource = document.getElementById('vertexShader').textContent;
    const fragmentShaderSource = document.getElementById('fragmentShader').textContent;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    // 4. Configuración de Buffers y Uniforms
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uMouse = gl.getUniformLocation(program, 'uMouse');

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // 5. Gestión del ratón
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX / window.innerWidth;
        mouse.targetY = 1.0 - e.clientY / window.innerHeight;
    });

    // Lógica para el efecto de los botones glass
    document.querySelectorAll('.glass-button').forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            button.style.setProperty('--x', x + '%');
            button.style.setProperty('--y', y + '%');
        });
    });

    // 6. Ciclo de Renderizado
    const startTime = Date.now();

    function render() {
        const currentTime = (Date.now() - startTime) * 0.001;

        // Suavizado del movimiento del ratón (Lerp)
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        gl.uniform1f(uTime, currentTime);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform2f(uMouse, mouse.x, mouse.y);

        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }

    render();
};

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initShaderEngine);