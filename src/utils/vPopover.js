import { computed } from 'vue';
import { ref, watch, reactive } from 'vue';

const popovers = [];

function Rect(element) {
  const values = reactive({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const calculate = () => {
    const { top, right, bottom, left, width, height } =
      element.getBoundingClientRect();

    values.top = top;
    values.right = right;
    values.bottom = bottom;
    values.left = left;
    values.width = width;
    values.height = height;
  };

  return {
    values,
    element,
    calculate,
  };
}

function addPopover({ id, trigger, onHover, onClick }) {
  const popover = {
    id,
    trigger: new Rect(trigger),
    children: [],
    isTriggerVisible: ref(false),
    isClickActive: ref(false),
    isHoverActive: null,
    calculateRectTimeout: null,
    observer: null,
    eventListeners: [],
  };

  const isHoverActiveInside = ref(false);

  popover.isHoverActive = computed(() => {
    return (
      isHoverActiveInside.value ||
      popover.children.some(
        ({ activator, isHoverActive }) =>
          activator === 'hover' && isHoverActive.value,
      )
    );
  });

  popover.observer = new IntersectionObserver(
    ([entry]) => {
      popover.isTriggerVisible.value = entry.isIntersecting;
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    },
  );

  popover.observer.observe(popover.trigger.element);

  popovers.push(popover);

  registerEventListener(popover, popover.trigger.element, 'closeclick', () => {
    popover.isClickActive.value = false;
  });

  registerEventListener(
    popover,
    window,
    'blur',
    () => {
      popover.isClickActive.value = false;
    },
    true,
  );

  registerEventListener(
    popover,
    document,
    'click',
    (event) => {
      if (
        !popover.trigger.element.contains(event.target) &&
        !popover.children.some(({ element }) => element.contains(event.target))
      ) {
        popover.isClickActive.value = false;
      }
    },
    true,
  );

  registerEventListener(
    popover,
    popover.trigger.element,
    'click',
    () => {
      popover.isClickActive.value = !popover.isClickActive.value;
    },
    true,
  );

  let timeout = null;

  registerEventListener(
    popover,
    popover.trigger.element,
    'mouseenter',
    (event) => {
      if (event.target !== popover.trigger.element) {
        return;
      }

      clearTimeout(timeout);

      isHoverActiveInside.value = true;
    },
    true,
  );

  registerEventListener(
    popover,
    popover.trigger.element,
    'mouseleave',
    (event) => {
      if (event.target !== popover.trigger.element) {
        return;
      }

      timeout = setTimeout(() => {
        isHoverActiveInside.value = false;
      }, 0);
    },
    true,
  );

  watch(() => popover.isClickActive.value, onClick);
  watch(() => popover.isHoverActive.value, onHover);

  watch(
    () => popover.isClickActive.value || popover.isHoverActive.value,
    (isActive) => {
      if (isActive) {
        const calculateRect = () => {
          popover.trigger.calculate();

          popover.children.forEach((child) => {
            child.rect.calculate();
          });

          popover.calculateRectTimeout = setTimeout(calculateRect, 0);
        };

        calculateRect();
      } else {
        clearTimeout(popover.calculateRectTimeout);
      }
    },
  );
}

function removePopover(id) {
  const [removed] = popovers.splice(
    popovers.indexOf((trigger) => trigger.id === id),
    1,
  );

  removed.children.forEach((child) => {
    child.unwatch();
  });

  removed.observer.unobserve(removed.trigger.element);

  removeAllListeners(removed);
}

function getContextUid(vnode, refElement) {
  return vnode.ctx.ctx.$el === refElement
    ? vnode.ctx.parent.uid
    : vnode.ctx.uid;
}

function getPopoverId(value, vnode, refElement) {
  return (
    value?.id ||
    (typeof value === 'string'
      ? value
      : 'uid-' + getContextUid(vnode, refElement))
  );
}

function registerTrigger(el, bindings, vnode) {
  const onHover = ($event) => {
    const onHover = bindings.value?.onHover;

    if (onHover) {
      onHover($event);
    }
  };

  const onClick = ($event) => {
    const onClick = bindings.value?.onClick;

    if (onClick) {
      onClick($event);
    }
  };

  addPopover({
    id: getPopoverId(bindings.value, vnode, el),
    trigger: el,
    onHover,
    onClick,
  });
}

function registerDetached(el, bindings, vnode) {
  const popoverId = getPopoverId(bindings.value, vnode, el);

  el.setAttribute('data-v-popover-detached', popoverId);
  el.style.display = 'none';

  const popover = popovers.find(({ id }) => id === popoverId);

  const rect = new Rect(el);

  const isHoverActive = ref(false);

  const activator = vnode.props.activator || 'click';

  const position = {
    horizontal: vnode.props.horizontal,
    vertical: vnode.props.vertical,
  };

  let timeout = null;

  registerEventListener(popover, el, 'mouseenter', (event) => {
    if (event.target !== el) {
      return;
    }

    clearTimeout(timeout);

    isHoverActive.value = true;
  });

  registerEventListener(popover, el, 'mouseleave', (event) => {
    if (event.target !== el) {
      return;
    }

    timeout = setTimeout(() => {
      isHoverActive.value = false;
    });
  });

  popover.children.push({
    element: el,
    activator,
    rect,
    isHoverActive,
    unwatch: watch(
      [
        () =>
          popover.isTriggerVisible.value &&
          (activator === 'click'
            ? popover.isClickActive.value
            : popover.isHoverActive.value),
        () => JSON.stringify(popover.trigger.values) + JSON.stringify(rect),
      ],
      (current, previous) => {
        const showChild = previous[0] === false && current[0] === true;
        const hideChild = previous[0] === true && current[0] === false;
        const changePosition = previous[1] !== current[1];
        const isActive = current[0];

        if (showChild) {
          el.style.display = null;
          el.style.position = 'fixed';

          rect.calculate();
        } else if (hideChild) {
          el.style.display = 'none';
        }

        if (isActive && changePosition) {
          reposition(popover.trigger.values, rect, el, position);
        }
      },
    ),
  });
}

export default {
  mounted(...args) {
    if (args[1].modifiers.trigger) {
      registerTrigger(...args);
    }

    if (args[1].modifiers.detached) {
      registerDetached(...args);
    }
  },

  beforeUnmount(el, bindings, vnode) {
    if (bindings.modifiers.trigger) {
      const popoverId =
        bindings.value?.id ||
        (typeof bindings.value === 'string'
          ? bindings.value
          : 'uid-' + getContextUid(vnode, el));

      removePopover(popoverId);
    }
  },
};

function reposition(trigger, rect, el, { vertical, horizontal }) {
  const { top, left, height, width } = trigger;

  if (vertical === 'center') {
    el.style.top = `${top + height / 2 - rect.values.height / 2}px`;
  }

  const topBottom = () => {
    return `${top + height}px`;
  };

  const bottomTop = () => {
    return `${top - rect.values.height}px`;
  };

  const rightRight = () => {
    return left + width - rect.values.width;
  };

  const leftLeft = () => {
    return left;
  };

  if (vertical === 'top-top') {
    el.style.top = `${top}px`;
  }

  if (vertical === 'top-bottom') {
    if (top + height + rect.values.height > window.innerHeight) {
      el.style.top = bottomTop();
    } else {
      el.style.top = topBottom();
    }
  }

  if (vertical === 'bottom-top') {
    if (top - rect.values.height < 0) {
      el.style.top = topBottom();
    } else {
      el.style.top = bottomTop();
    }
  }

  if (vertical === 'bottom-bottom') {
    el.style.top = `${top + height - rect.values.height}px`;
  }

  if (horizontal === 'left-left') {
    if (leftLeft() + rect.values.width >= document.body.clientWidth) {
      el.style.right = `${document.body.clientWidth - rightRight() - rect.values.width}px`;
    } else {
      el.style.right = `${document.body.clientWidth - left - rect.values.width}px`;
    }
  }

  if (horizontal === 'center') {
    el.style.left = `${left + height / 2 - rect.values.width / 2}px`;
  }

  if (horizontal === 'left-right') {
    el.style.left = `${left + width}px`;
  }

  if (horizontal === 'right-left') {
    el.style.left = `${left - rect.values.width}px`;
  }

  if (horizontal === 'right-right') {
    if (rightRight() < 0) {
      el.style.left = `${leftLeft()}px`;
    } else {
      el.style.left = `${rightRight()}px`;
    }
  }
}

function registerEventListener(popover, element, type, callback, useCapture) {
  popover.eventListeners.push([element, type, callback, useCapture]);

  element.addEventListener(type, callback, useCapture);
}

function removeAllListeners(popover) {
  popover.eventListeners.forEach(([element, type, callback, useCapture]) => {
    element.removeEventListener(type, callback, useCapture);
  });
}
