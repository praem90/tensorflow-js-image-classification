import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let modelPromise, video, canvas, ctx, labelContainer;

window.onload = init;

// Load the image model and setup the webcam
async function init() {
    
    modelPromise = cocoSsd.load();
    canvas = document.getElementById('preview');
    labelContainer = document.getElementById("label-container");


    const player = new Clappr.Player({
        source: '/BigBuckBunny.mp4',
        // source: 'https://streamspace.live/hls/jptv/livestream.m3u8',
        // source: 'https://ce6f091ea3c5.us-west-2.playback.live-video.net/api/video/v1/us-west-2.409979216872.channel.p55JDUTJwMKL.m3u8',
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

    const resizePlayer = () => {
        let width = clapper_player.offsetWidth;

        if (window.innerWidth < 640) {
            width = clapper_player.parentNode.offsetWidth;
        }

        player.resize({
            width: width,
            height: width*9/16,
        });
    };
    window.addEventListener('resize', resizePlayer);

    resizePlayer();


    player.on('play', function () {
        video = player.core.mediaControl.container.playback.el;

        video.crossOrigin = "anonymous";
        if (!canvas) {
            canvas = document.createElement('canvas');
        }
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.crossOrigin = "anonymous";

        // document.body.append(canvas);

        ctx = canvas.getContext('2d');

        window.requestAnimationFrame(loop);
    });
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
        }, 1000);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const model = await modelPromise;
    let result = await model.detect(canvas);
    const predictions = {};
  
    console.log('number of detections: ', result.length);
    for (let i = 0; i < result.length; i++) {
      if (!predictions[result[i].class]) {
        predictions[result[i].class] = {count: 0, class: result[i].class};
      } 
      predictions[result[i].class].count++;
    }

    labelContainer.innerHTML = '';

    const lables = Object.keys(predictions);

    for (let i = 0; i < lables.length; i++) { // and class labels
        labelContainer.innerHTML += renderLabel(i, predictions[lables[i]]);
    }
}

function renderLabel(i, prediction) {
    const colors = [
        'lime',
        'blue',
        'orange',
        'yello',
        'amber',
    ];


    i = i%(colors.length - 1);
    
    let content = `<div class="pt-1">
    <div>
      <h2 class="text-6xl text-center font-semibold  uppercase rounded-full text-green-600 text-${colors[i]}-600">
        ${prediction.class ||  ''} - ${prediction.count}
      </h2>
    </div>
</div>`;

    return content;
}
