const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const G = 0.05;
const objects = [];
let orbitSpeeds = 0.2;
let zoom = 1;
let offsetX = 0, offsetY = 0;
let dragging = false;
let lastX, lastY;

const stars = [];
const numStars = 200;
for (let i = 0; i < numStars; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5,
        brightness: Math.random() * 0.5 + 0.5,
        speed: Math.random() * 0.5 + 0.2
    });
}

class OrbitalObject {
    constructor(radius, angle, speed, mass, color, eccentricity = 0) {
        this.radius = radius;
        this.angle = angle;
        this.speed = speed * orbitSpeeds;
        this.mass = mass;
        this.color = color;
        this.eccentricity = eccentricity;
        this.trail = [];
    }

    update() {
        this.angle += this.speed;
        let r = this.radius * (1 + this.eccentricity * Math.cos(this.angle));
        this.x = canvas.width / 2 + offsetX + r * Math.cos(this.angle) * zoom;
        this.y = canvas.height / 2 + offsetY + r * Math.sin(this.angle) * zoom;

        this.trail.push({ x: this.x, y: this.y, opacity: 1 });
        if (this.trail.length > 100) this.trail.shift();
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.mass * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            let point = this.trail[i];
            ctx.globalAlpha = point.opacity;
            ctx.lineTo(point.x, point.y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

const sun = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    mass: 20,
    color: "yellow"
};

const colors = ["red", "blue", "green", "purple", "orange", "pink", "cyan"];
const orbitDistances = [80, 160, 240, 320, 400, 480, 560];
for (let i = 0; i < orbitDistances.length; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = Math.sqrt(G * sun.mass / orbitDistances[i]);
    objects.push(new OrbitalObject(orbitDistances[i], angle, speed, 5, colors[i % colors.length]));
}

function drawStars() {
    for (let star of stars) {
        ctx.globalAlpha = star.brightness;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = -2;
            star.x = Math.random() * canvas.width;
        }
        star.brightness += (Math.random() > 0.5 ? 1 : -1) * 0.02;
        star.brightness = Math.max(0.3, Math.min(1, star.brightness));
    }
}

function animate() {
    ctx.fillStyle = "rgba(10, 10, 42, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();

    ctx.shadowBlur = 30;
    ctx.shadowColor = "yellow";
    ctx.fillStyle = sun.color;
    ctx.beginPath();
    ctx.arc(sun.x + offsetX, sun.y + offsetY, sun.mass * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let obj of objects) {
        obj.update();
        obj.draw();
    }

    requestAnimationFrame(animate);
}
animate();

document.addEventListener("click", (event) => {
    let dx = (event.clientX - canvas.width / 2 - offsetX) / zoom;
    let dy = (event.clientY - canvas.height / 2 - offsetY) / zoom;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx);
    let speed = Math.sqrt(G * sun.mass / distance) * (0.5 + Math.random() * 0.3);
    let color = colors[Math.floor(Math.random() * colors.length)];
    let eccentricity = Math.random() * 0.4;
    objects.push(new OrbitalObject(distance, angle, speed, 5, color, eccentricity));
});

document.addEventListener("wheel", (event) => {
    zoom += event.deltaY * -0.001;
    zoom = Math.max(0.5, Math.min(2, zoom));
});

document.addEventListener("mousedown", (event) => {
    
    lastX = event.clientX;
    lastY = event.clientY;
});

document.addEventListener("mousemove", (event) => {
    if (dragging) {
        offsetX += event.clientX - lastX;
        offsetY += event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
    }
});

document.addEventListener("mouseup", () => {
    dragging = false;
});
