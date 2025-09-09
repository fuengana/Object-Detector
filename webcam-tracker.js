const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const startButton = document.getElementById('start-button');
const context = canvasElement.getContext('2d');
let model = undefined;

const loadModelAndStart = async () => {
    try {
        // Load the pre-trained COCO-SSD model
        model = await cocoSsd.load();
        console.log('Model loaded successfully.');
        startButton.textContent = 'Start Tracking';
        startButton.disabled = false;
    } catch (error) {
        console.error('Failed to load model:', error);
        alert('Could not load AI model. Please check your internet connection.');
    }
};

const setupWebcam = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamElement.srcObject = stream;
        
        // Wait for video to load before getting its dimensions
        await new Promise((resolve) => {
            webcamElement.onloadedmetadata = () => {
                resolve();
            };
        });

        // Match canvas dimensions to video feed
        canvasElement.width = webcamElement.videoWidth;
        canvasElement.height = webcamElement.videoHeight;
        
        webcamElement.play();
        startButton.style.display = 'none'; // Hide button after starting
        predictObject(); // Start the tracking loop
    } catch (error) {
        console.error('Error accessing the webcam:', error);
        alert('Could not start webcam. Please check your camera permissions and try again.');
    }
};

const predictObject = async () => {
    if (!model) return;

    // Detect objects in the current video frame
    const predictions = await model.detect(webcamElement);

    // Draw the video frame on the canvas
    context.drawImage(webcamElement, 0, 0, webcamElement.videoWidth, webcamElement.videoHeight);

    // Draw bounding boxes for each detected object
    predictions.forEach(prediction => {
        context.beginPath();
        context.rect(...prediction.bbox); // The bbox is [x, y, width, height]
        context.lineWidth = 2;
        context.font = `40px Verdana`;
        context.strokeStyle = 'white';
        context.fillStyle = 'white';
        context.stroke();
        context.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            prediction.bbox[0],
            prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
        );
    });

    // Use requestAnimationFrame to create a continuous loop
    requestAnimationFrame(predictObject);
};

startButton.addEventListener('click', () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setupWebcam();
    } else {
        alert('getUserMedia is not supported by your browser.');
    }
});

// Initial model load
loadModelAndStart();
