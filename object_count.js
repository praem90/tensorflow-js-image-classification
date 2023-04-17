import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let modelPromise, video, canvas, ctx;

window.onload = init;

// Load the image model and setup the webcam
async function init() {
    
    modelPromise = cocoSsd.load();

    const player = new Clappr.Player({
        source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
        }, 2000);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const model = await modelPromise;
    let predictions = await model.detect(canvas);

    console.log(predictions);

    // labelContainer.innerHTML = renderLabel(predictions);
}

function renderLabel(i, prediction) {
    const colors = [
        'lime',
        'blue',
        'orange',
        'yello',
        'amber',
    ];

    const probability = ( prediction.probability * 100 ).toFixed(2);
    let content = `<div class="m-auto relative pt-1">
    <div>
      <h2 class="text-6xl text-center font-semibold  uppercase rounded-full text-green-600 text-${colors[i]}-600">
        ${prediction.className ||  ''}
      </h2>
      <p class="text-4xl text-center font-semibold text-${colors[i]}-600">
        ${probability}%
      </p>
    </div>
  <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-${colors[i]}-200">
    <div style="width:${probability}%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${colors[i]}-500"></div>
  </div>
</div>`;

    return content;
}
