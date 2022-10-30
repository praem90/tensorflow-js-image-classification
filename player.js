import '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";

let model, ctx, canvas, labelContainer, maxPredictions, video;

window.onload = init;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const player = new Clappr.Player({
        // source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        // source: 'https://streamspace.live/hls/jptv/livestream.m3u8',
        source: 'https://streamspace.live/hls/eachone/teachone.m3u8',
        autoPlay: true,
        mute: false,
        plugins: [
            LevelSelector,
            ClapprCapturePlugin

        ],
        aspectRatio: 16 / 9,
        events: {
            ready: () => {
                console.log('Ready');
            }
        }
    });

    const clapper_player =document.getElementById('clapper_player');
    player.attachTo(clapper_player);


    player.on('play', function () {
        video = player.core.mediaControl.container.playback.el;

        video.crossOrigin = "anonymous";
        if (!canvas) {
            canvas = document.createElement('canvas');
        }
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;

        // document.body.append(canvas);

        ctx = canvas.getContext('2d');

        window.requestAnimationFrame(loop);
    });

    // append elements to the DOM
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        await predict();
    } catch (f){
        console.log(f);
    }
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}


