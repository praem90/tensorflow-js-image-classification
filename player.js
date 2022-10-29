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
        source: 'https://streamspace.live/hls/jptv/livestream.m3u8',
        autoPlay: true,
        mute: false,
        plugins: [
            LevelSelector
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

    player.on('ready', function () {
        video = document.querySelector('#clapper_player video');

        canvas = document.createElement('canvas');
        canvas.width  = clapper_player.offsetWidth;
        canvas.height = clapper_player.offsetHeight;

        ctx = canvas.getContext('2d');
        // window.requestAnimationFrame(loop);
    });

    player.on('play', function () {
        while (true) {
            loop();
        }
    });



    // append elements to the DOM
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    ctx.drawImage(video, 0, 0);
    console.log('loop');
    await predict();
    // window.requestAnimationFrame(loop);
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


