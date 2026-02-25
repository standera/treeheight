const video = document.getElementById("video");
const dist = document.getElementById("distance");
const info = document.getElementById("heightInfo");
const label = document.getElementById("label");

let angleRaw = 0;
let angleSmooth = 0;
let samples = [];
let topAngle = null;
let bottomAngle = null;

// ⭐ Start everything

async function startApp() {
    try {
        // iOS motion permission
        if (typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function") {
            const response = await DeviceOrientationEvent.requestPermission();
            if (response !== "granted") throw new Error("Motion permission denied");
        }
        // orientation sensor
        window.addEventListener("deviceorientation", onOrientationChanged);
        // camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
            facingMode: "environment"
        }
        });
        video.srcObject = stream;
    }
    catch (err) {
        alert("Error:\n" + err.name + "\n" + err.message);
        console.error(err);
    }
}

// ⭐ Orientation updates
function onOrientationChanged(event) {
    if (event.beta === null) return;
    angleRaw = event.beta;

    // strong smoothing
    angleSmooth = 0.95 * angleSmooth + 0.05 * angleRaw;
    samples.push(angleSmooth);
    if (samples.length > 40) samples.shift();
    updateDisplay();
}

// ⭐ Average angle
function averageSamples() {
    let sum = 0;
    for (let a of samples) sum += a;
    return sum / samples.length;
}

// ⭐ Store angles
function setTop() {
    topAngle = averageSamples();
    samples = [];
    updateDisplay();
}

function setBottom() {
    bottomAngle = averageSamples();
    samples = [];
    updateDisplay();
}

// ⭐ Height calculation
function updateDisplay() {
    const distance = parseFloat(dist.value);
    label.innerHTML = "Distance: " + distance + " m";
    let text = "Angle: " + angleSmooth.toFixed(2) + "°<br>";
    if (topAngle !== null) text += "Top: " + topAngle.toFixed(2) + "°<br>";
    if (bottomAngle !== null) text += "Bottom: " + bottomAngle.toFixed(2) + "°<br>";
    if (topAngle !== null && bottomAngle !== null) {
        const topRad = topAngle * Math.PI / 180;
        const bottomRad = bottomAngle * Math.PI / 180;
        const height = distance * (Math.tan(topRad) - Math.tan(bottomRad));
        text += "<b>Height: " + height.toFixed(2) + " m</b>";
    }
    info.innerHTML = text;
}

dist.oninput = updateDisplay;
