<template>
  <div
    class="badge-3d-wrapper"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <div ref="badge3d" class="badge-3d">
      <div class="badge-layer rim">
        <slot></slot>
      </div>
      <div class="badge-layer edge-2">
        <slot></slot>
      </div>
      <div class="badge-layer edge-1">
        <slot></slot>
      </div>
      <div class="badge-layer front">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';

const badge3d = ref<HTMLElement | null>(null);
let bounds: DOMRect | null = null;
const tiltStrength = 30;

function onMouseEnter(event: MouseEvent): void {
  const target = event.currentTarget as HTMLElement;
  bounds = target.getBoundingClientRect();
}

function onMouseMove(event: MouseEvent): void {
  if (!bounds) return;
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  const cx = x - bounds.width / 2;
  const cy = y - bounds.height / 2;
  if (badge3d.value) {
    badge3d.value.style.transform = `rotateX(${
      (-cy / bounds.height) * tiltStrength
    }deg) rotateY(${
      (cx / bounds.width) * tiltStrength
    }deg) scale3d(1.06, 1.06, 1.06)`;
  }
}

function onMouseLeave(): void {
  if (badge3d.value) {
    badge3d.value.style.transform = '';
  }
  bounds = null;
}

onBeforeUnmount(() => {
  onMouseLeave();
});
</script>

<style lang="scss" scoped>
.badge-3d-wrapper {
  perspective: 1600px;
  display: inline-block;
  width: 100%;
  height: 100%;
}

.badge-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.12s ease-out;
}

.badge-layer {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  pointer-events: none;

  >>> * {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.rim {
  transform: translateZ(6px);
  filter: drop-shadow(1px 0 0 var(--status-secondary-color))
    drop-shadow(-1px 0 0 var(--status-secondary-color))
    drop-shadow(0 1px 0 var(--status-secondary-color))
    drop-shadow(0 -1px 0 var(--status-secondary-color));
  opacity: 0.9;
}

.edge-2 {
  transform: translateZ(18px);
}

.edge-1 {
  transform: translateZ(30px);
}

.front {
  transform: translateZ(42px);
}

@media (prefers-reduced-motion: reduce) {
  .badge-3d {
    transform: none !important;
  }
}

@media (hover: none) and (pointer: coarse) {
  .badge-3d {
    transform: none;
  }

  .badge-layer.rim,
  .badge-layer.edge-1,
  .badge-layer.edge-2 {
    display: none;
  }
}
</style>
