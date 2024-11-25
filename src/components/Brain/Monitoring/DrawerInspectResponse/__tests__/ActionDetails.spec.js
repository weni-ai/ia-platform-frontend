import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import ActionDetails from '../ActionDetails.vue';

describe('ActionDetails.vue', () => {
  let wrapper;
  const actionMock = {
    name: 'Sample Action',
  };

  beforeEach(() => {
    wrapper = shallowMount(ActionDetails, {
      props: {
        action: actionMock,
      },
    });
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should renders the action name', () => {
    const actionName = wrapper.find('[data-testid="action-name"]');
    expect(actionName.exists()).toBe(true);
    expect(actionName.text()).toBe(actionMock.name);
  });

  it('should renders the action icon with correct props', () => {
    const avatarIcon = wrapper.findComponent('[data-testid="action-icon"]');
    expect(avatarIcon.exists()).toBe(true);

    expect(avatarIcon.props()).toMatchObject({
      size: 'sm',
      icon: 'bolt',
      scheme: 'aux-blue',
    });
  });

  it('should applies the correct class to the action details container', () => {
    const actionDetailsContainer = wrapper.find(
      '[data-testid="action-details-container"]',
    );
    expect(actionDetailsContainer.classes()).toContain('action-details');
  });
});
