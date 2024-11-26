<template>
  <slot
    :popoverId="popoverId"
    :isActivatedByClick="isClickActive"
    :isActivatedByHover="isHoverActive"
  />

  <Teleport to="body">
    <slot
      name="children"
      :popoverId="popoverId"
    />
  </Teleport>
</template>

<script setup>
import {
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';

const instance = getCurrentInstance();

const props = defineProps({
  isActivatedByClick: Boolean,
});

const popoverId = ref('unnnic-popover-' + Math.floor(Math.random() * 1e8));

const target = ref();
const targetDimensions = reactive({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0,
});

const children = ref([]);

const actives = ref([]);

const currentIndex = ref(0);

const has = reactive({
  click: false,
  hover: false,
});

const isClickActive = ref(false);
const isHoverActive = ref(false);

const emit = defineEmits(['update:isActivatedByClick']);

watch(
  () => isClickActive.value,
  () => {
    emit('update:isActivatedByClick', isClickActive.value);
  },
);

watch(
  () => props.isActivatedByClick,
  () => {
    if (props.isActivatedByClick !== isClickActive.value) {
      isClickActive.value = props.isActivatedByClick;
    }
  },
);

const render = ref(null);

const observer = ref(null);

const isTargetVisible = ref(null);

onMounted(() => {
  target.value = instance.vnode.el.nextElementSibling;

  document
    .querySelectorAll(`[popoverid="${popoverId.value}"]`)
    .forEach((element) => {
      const child = {
        id: currentIndex.value++,
        el: element,
        trigger: element.getAttribute('trigger'),
        horizontal: element.getAttribute('horizontal'),
        vertical: element.getAttribute('vertical'),
        dimensions: reactive({
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: 0,
          height: 0,
        }),
      };

      child.recalculate = () => {
        const dimensions = calculate(child.el);

        child.dimensions.top = dimensions.top;
        child.dimensions.right = dimensions.right;
        child.dimensions.bottom = dimensions.bottom;
        child.dimensions.left = dimensions.left;
        child.dimensions.width = dimensions.width;
        child.dimensions.height = dimensions.height;
      };

      child.reposition = () => {
        const target = targetDimensions;

        const style = child.el.computedStyleMap();

        function topBottom() {
          return target.top + target.height + style.get('margin-top').value;
        }

        function bottomTop() {
          return (
            target.top -
            child.dimensions.height -
            style.get('margin-bottom').value
          );
        }

        function leftLeft() {
          return target.left + style.get('margin-left').value;
        }

        function rightRight() {
          return (
            target.left +
            target.width -
            child.dimensions.width -
            style.get('margin-right').value
          );
        }

        if (child.vertical === 'center') {
          child.el.style.top = `${target.top + target.height / 2 - child.dimensions.height / 2}px`;
        } else if (child.vertical === 'top-top') {
          child.el.style.top = `${target.top}px`;
        } else if (child.vertical === 'top-bottom') {
          if (topBottom() + child.dimensions.height > window.innerHeight) {
            child.el.style.top = `${bottomTop() - style.get('margin-top').value}px`;
          } else {
            child.el.style.top = `${topBottom() - style.get('margin-top').value}px`;
          }
        } else if (child.vertical === 'bottom-top') {
          if (bottomTop() < 0) {
            child.el.style.top = `${topBottom() - style.get('margin-top').value}px`;
          } else {
            child.el.style.top = `${bottomTop() - style.get('margin-top').value}px`;
          }
        } else if (child.vertical === 'bottom-bottom') {
          child.el.style.top = `${target.top + target.height - child.dimensions.height}px`;
        }

        if (child.horizontal === 'center') {
          child.el.style.left = `${target.left + target.width / 2 - child.dimensions.width / 2}px`;
        } else if (child.horizontal === 'left-left') {
          if (
            leftLeft() + child.dimensions.width >=
            document.body.clientWidth
          ) {
            child.el.style.left = `${rightRight() - style.get('margin-left').value}px`;
          } else {
            child.el.style.left = `${leftLeft() - style.get('margin-left').value}px`;
          }
        } else if (child.horizontal === 'right-right') {
          if (rightRight() < 0) {
            child.el.style.left = `${leftLeft() - style.get('margin-left').value}px`;
          } else {
            child.el.style.left = `${rightRight() - style.get('margin-left').value}px`;
          }
        } else if (child.horizontal === 'right-left') {
          child.el.style.left = `${target.left - child.dimensions.width}px`;
        } else if (child.horizontal === 'left-right') {
          child.el.style.left = `${target.left + target.width}px`;
        }
      };

      let watcher;

      let timeoutUpdateInside = null;

      const updateInside = () => {
        child.recalculate();

        timeoutUpdateInside = setTimeout(updateInside, 0);
      };

      child.show = () => {
        child.el.style.display = null;
        child.el.style.position = 'fixed';
        child.el.style.zIndex = '10000';

        watcher = watch(
          () => [targetDimensions, child.dimensions],
          () => {
            child.reposition();
          },
          {
            deep: true,
          },
        );

        updateInside();
      };

      child.hide = () => {
        child.el.style.display = 'none';

        clearTimeout(timeoutUpdateInside);

        if (watcher) {
          watcher();
        }
      };

      if (child.trigger === 'click') {
        has.click = true;
      }

      if (child.trigger === 'hover') {
        has.hover = true;
      }

      child.hide();

      children.value.push(child);
    });

  if (has.click) {
    target.value.addEventListener('click', onClickTarget);
    document.addEventListener('click', clickOutside, true);
  }

  if (has.hover) {
    target.value.addEventListener('mouseenter', onMouseEnter);
    target.value.addEventListener('mouseleave', onMouseLeave);
  }

  children.value
    .filter(({ trigger }) => trigger === 'hover')
    .forEach(({ el }) => {
      el.addEventListener('mouseenter', onMouseEnterChild);
      el.addEventListener('mouseleave', onMouseLeaveChild);
    });

  observer.value = new IntersectionObserver(
    ([entry]) => {
      isTargetVisible.value = entry.isIntersecting;
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    },
  );

  observer.value.observe(target.value);
});

onBeforeUnmount(() => {
  children.value.forEach(unregisterChild);

  if (has.click) {
    target.value.removeEventListener('click', onClickTarget);
    document.removeEventListener('click', clickOutside, true);
  }

  if (has.hover) {
    target.value.removeEventListener('mouseenter', onMouseEnter);
    target.value.removeEventListener('mouseleave', onMouseLeave);

    children.value
      .filter(({ trigger }) => trigger === 'hover')
      .forEach(({ el }) => {
        el.removeEventListener('mouseenter', onMouseEnterChild);
        el.removeEventListener('mouseleave', onMouseLeaveChild);
      });
  }

  children.value.forEach(({ hide }) => hide());

  observer.value.unobserve(target.value);

  clearTimeout(render.value);
});

function unregisterChild(child) {
  const index = actives.value.indexOf(child);

  if (index !== -1) {
    actives.value.splice(index, 1);
  }
}

watch(
  () => isClickActive.value,
  () => {
    if (isClickActive.value) {
      const clicksActivated = children.value.filter(
        ({ trigger }) => trigger === 'click',
      );

      clicksActivated.forEach(({ show }) => show());

      actives.value.push(...clicksActivated);
    } else {
      actives.value
        .filter(({ trigger }) => trigger === 'click')
        .forEach((child) => child.hide());

      actives.value = actives.value.filter(
        ({ trigger }) => trigger !== 'click',
      );
    }
  },
);

watch(
  () => isHoverActive.value,
  () => {
    if (isHoverActive.value) {
      const hoverActivated = children.value.filter(
        ({ trigger }) => trigger === 'hover',
      );

      actives.value.push(...hoverActivated);
    } else {
      actives.value
        .filter(({ trigger }) => trigger === 'hover')
        .forEach((child) => child.hide());

      actives.value = actives.value.filter(
        ({ trigger }) => trigger !== 'hover',
      );
    }
  },
);

function update() {
  recalculateTarget();

  render.value = setTimeout(update, 0);
}

watch(
  () => isTargetVisible.value && (isClickActive.value || isHoverActive.value),
  (isActive) => {
    if (isActive) {
      update();
      actives.value.forEach(({ show }) => show());
    } else {
      actives.value.forEach(({ hide }) => hide());
      clearTimeout(render.value);
    }
  },
);

function recalculateTarget() {
  const dimensions = calculate(target.value);

  targetDimensions.top = dimensions.top;
  targetDimensions.right = dimensions.right;
  targetDimensions.bottom = dimensions.bottom;
  targetDimensions.left = dimensions.left;
  targetDimensions.width = dimensions.width;
  targetDimensions.height = dimensions.height;
}

function calculate(element) {
  const { top, right, bottom, left, width, height } =
    element.getBoundingClientRect();

  return { top, right, bottom, left, width, height };
}

function onClickTarget() {
  isClickActive.value = !isClickActive.value;
}

function clickOutside(event) {
  if (
    isClickActive.value &&
    !target.value.contains(event.target) &&
    !children.value
      .filter(({ trigger }) => trigger === 'click')
      .some(({ el }) => el.contains(event.target))
  ) {
    isClickActive.value = false;
  }
}

function onMouseEnter() {
  isHoverActive.value = true;
}

function onMouseLeave(event) {
  isHoverActive.value = false;
}

function onMouseEnterChild() {
  isHoverActive.value = true;
}

function onMouseLeaveChild() {
  if (isHoverActive.value) {
    isHoverActive.value = false;
  }
}
</script>
