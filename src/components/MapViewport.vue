<template>
  <section
    ref="mapElement"
    class="map-viewport"
  />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

import { Map, View, Feature } from 'ol';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { Point } from 'ol/geom';
import { Icon, Style } from 'ol/style';

import PlaceIcon from '@/assets/icons/place.png';

const props = defineProps({
  geolocation: {
    type: String,
    default: '',
  },
});

const mapElement = ref(null);
const coordinates = computed(() => {
  const [latitude, longitude] = props.geolocation.split(',').map(Number);
  return fromLonLat([longitude, latitude]);
});
const point = computed(() => new Point(coordinates.value));

const initializeMap = () => {
  new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      new VectorLayer({
        source: new VectorSource({
          features: [new Feature(point.value)],
        }),
        style: new Style({
          image: new Icon({
            src: PlaceIcon,
            scale: 0.8,
          }),
        }),
      }),
    ],
    target: mapElement.value,
    view: new View({
      center: coordinates.value,
      zoom: 12,
    }),
    controls: [],
  });
};

onMounted(initializeMap);
</script>

<style scoped lang="scss">
.map-viewport {
  overflow: hidden;

  width: 100%;
  height: 100%;

  aspect-ratio: 1 / 1;

  :deep(.ol-viewport) {
    border-radius: calc(
      $unnnic-border-radius-md - $unnnic-border-radius-sm / 2
    );
  }
}
</style>
