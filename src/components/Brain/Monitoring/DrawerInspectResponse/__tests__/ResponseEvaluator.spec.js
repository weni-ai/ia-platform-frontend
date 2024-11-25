import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { useMonitoringStore } from '@/store/Monitoring';

import ResponseEvaluator from '../ResponseEvaluator.vue';
import i18n from '@/utils/plugins/i18n';

const rateAnswerMock = vi.fn();

vi.mock('@/store/Monitoring', () => ({
  useMonitoringStore: vi.fn(() => ({
    rateAnswer: rateAnswerMock,
  })),
}));

describe('ResponseEvaluator.vue', () => {
  let wrapper;
  let monitoringStoreMock;
  let setIsApprovedSpy;

  const mountWrapper = (props = {}) => {
    monitoringStoreMock = useMonitoringStore();

    return shallowMount(ResponseEvaluator, {
      props: {
        isApproved: null,
        ...props,
      },
    });
  };

  const contextT = (key) =>
    i18n.global.t(`router.monitoring.inspect_response.${key}`);

  beforeEach(() => {
    wrapper = mountWrapper();

    setIsApprovedSpy = vi.spyOn(wrapper.vm, 'setIsApproved');
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should renders the divider', () => {
    const divider = wrapper.findComponent('[data-testid="divider"]');

    expect(divider.exists()).toBe(true);
  });

  it('should renders the rate-the-answer text with correct props', () => {
    const rateText = wrapper.findComponent('[data-testid="rate-the-answer"]');
    expect(rateText.exists()).toBe(true);
    expect(rateText.props()).toMatchObject({
      color: 'neutral-dark',
      family: 'secondary',
      size: 'body-gt',
      tag: 'p',
    });
  });

  it('should renders the "I liked" button with correct text', () => {
    const likeButton = wrapper.find('[data-testid="like-button"]');
    expect(likeButton.exists()).toBe(true);
    expect(likeButton.text()).toContain(contextT('i_liked'));
  });

  it('should renders the "I didn’t like" button with correct text', () => {
    const dislikeButton = wrapper.find('[data-testid="dislike-button"]');
    expect(dislikeButton.exists()).toBe(true);
    expect(dislikeButton.text()).toContain(contextT('i_didnt_like'));
  });

  it('should calls setIsApproved(true) when the like button is clicked', async () => {
    const likeButton = wrapper.find('[data-testid="like-button"]');
    await likeButton.trigger('click');
    expect(setIsApprovedSpy).toHaveBeenCalledWith(true);
  });

  it('should calls setIsApproved(false) when the dislike button is clicked', async () => {
    const dislikeButton = wrapper.find('[data-testid="dislike-button"]');
    await dislikeButton.trigger('click');
    expect(setIsApprovedSpy).toHaveBeenCalledWith(false);
  });

  it('should applies the bold class to the like button when isApproved is true', async () => {
    wrapper = mountWrapper({ isApproved: true });
    const likeButton = wrapper.find('[data-testid="like-button"]');
    expect(likeButton.classes()).toContain('actions__button--bold');
  });

  it('should applies the bold class to the dislike button when isApproved is false', async () => {
    wrapper = mountWrapper({ isApproved: false });
    const dislikeButton = wrapper.find('[data-testid="dislike-button"]');
    expect(dislikeButton.classes()).toContain('actions__button--bold');
  });

  describe('setIsApproved function', () => {
    it('should call rateAnswer with the correct value', async () => {
      await wrapper.vm.setIsApproved(true);

      expect(rateAnswerMock).toHaveBeenCalledWith({
        is_approved: true,
      });
      expect(wrapper.vm.isApproved).toBe(true);
    });

    it('should update isApproved to the new value', async () => {
      await wrapper.vm.setIsApproved(false);

      expect(wrapper.vm.isApproved).toBe(false);
    });

    describe('rateAnswer fail behaviors', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      beforeEach(() => {
        monitoringStoreMock.rateAnswer.mockRejectedValue(
          new Error('Store Error'),
        );
      });

      afterEach(() => {
        vi.clearAllMocks();
      });

      it('should restore the previous value of isApproved if rateAnswer fails', async () => {
        await wrapper.vm.setIsApproved(false);

        expect(wrapper.vm.isApproved).toBe(null);
      });

      it('should log an error if rateAnswer fails', async () => {
        await wrapper.vm.setIsApproved(false);

        expect(consoleSpy).toHaveBeenCalledWith('error', expect.any(Error));
      });
    });
  });
});
