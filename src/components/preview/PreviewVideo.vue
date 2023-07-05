<template>
  <div ref="player" id="player"></div>
</template>

<script setup>
import DPlayer from "dplayer";
import { nextTick, onMounted, ref, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

const props = defineProps({
  url: {
    type: String,
  },
});

const videoInfo = ref({
  video: null,
});

const player = ref();
const initPlayer = () => {
  // theme	'#b7daff'	主题色
  // screenshot	false	开启截图，如果开启，视频和视频封面需要允许跨域
  // video	-	视频信息
  // video.url	-	视频链接
  // video.type	'auto'	可选值: 'auto', 'hls', 'flv', 'dash', 'webtorrent', 'normal' 或其他自定义类型,
  // video.customType	-	自定义类型
  const dp = new DPlayer({
    element: player.value,
    theme: "#b7daff",
    screenshot: true,
    video: {
      url: `/api${props.url}`,
      type: "customHls",
      customType: {
        customHls: function (video, player) {
          const hls = new Hls();
          hls.loadSource(video.src);
          hls.attachMedia(video);
        },
      },
    },
  });
};

onMounted(() => {
  initPlayer();
});
</script>

<style lang="scss" scoped>
#player {
  width: 100%;
  :deep .dplayer-video-wrap {
    text-align: center;
    .dplayer-video {
      margin: 0px auto;
      max-height: calc(100vh - 41px);
    }
  }
}
</style>
