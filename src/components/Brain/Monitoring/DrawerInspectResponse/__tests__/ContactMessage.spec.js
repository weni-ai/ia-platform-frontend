import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import ContactMessage from '../ContactMessage.vue';

describe('ContactMessage.vue', () => {
  let wrapper;
  const messageMock = 'Contact message mock';

  beforeEach(() => {
    wrapper = shallowMount(ContactMessage, {
      props: {
        text: messageMock,
      },
    });
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should renders the contact message title with correct props', () => {
    const contactMessageTitle = wrapper.findComponent(
      '[data-testid="contact-message-title"]',
    );
    expect(contactMessageTitle.exists()).toBe(true);
    expect(contactMessageTitle.props()).toMatchObject({
      color: 'neutral-cloudy',
      family: 'secondary',
      size: 'body-gt',
      tag: 'p',
    });
  });

  it('should renders the contact message text', () => {
    const contactMessageText = wrapper.find(
      '[data-testid="contact-message-text"]',
    );
    expect(contactMessageText.exists()).toBe(true);
    expect(contactMessageText.text()).toBe(`“${messageMock}”`);
  });

  it('should applies the correct class to the contact message container', () => {
    const contactMessageContainer = wrapper.find(
      '[data-testid="contact-message-container"]',
    );
    expect(contactMessageContainer.classes()).toContain(
      'inspect-response__contact',
    );
  });
});
