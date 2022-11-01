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
        source: 'https://streamspace.live/hls/jptv/livestream.m3u8',
        // source: 'https://streamspace.live/hls/eachone/teachone.m3u8',
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
        const label = document.createElement('div');
        label.innerHTML = renderLabel(i, {probability: 0});
        labelContainer.appendChild(label);
    }
}

async function loop() {
    try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        await predict();
    } catch (f){
        console.log(f);
    }
        setTimeout(() => {
            window.requestAnimationFrame(loop);
        }, 2000);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(canvas);
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.childNodes[i].innerHTML = renderLabel(i, prediction[i]);
    }
}

function renderLabel(i, prediction) {
    const colors = [
        'pink',
        'amber',
        'blue',
        'red',
        'green',
    ];

    const probability = prediction.probability.toFixed(2) * 100;
    let content = `<div class="relative pt-1">
  <div class="flex mb-2 items-center justify-between">
    <div>
      <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-${colors[i]}-600">
        ${prediction.className ||  ''}
      </span>
    </div>
    <div class="text-right">
      <span class="text-xs font-semibold inline-block text-${colors[i]}-600">
        ${probability}%
      </span>
    </div>
  </div>
  <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-${colors[i]}-200">
    <div style="width:${probability}%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${colors[i]}-500"></div>
  </div>
</div>`;

    return content;
}
