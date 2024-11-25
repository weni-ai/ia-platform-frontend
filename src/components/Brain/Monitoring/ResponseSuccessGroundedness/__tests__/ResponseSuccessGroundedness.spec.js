import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ResponseSuccessGroundedness from '../index.vue';
import TextSentences from '../TextSentences.vue';
import GroundednessSources from '../GroundednessSources.vue';

describe('ResponseSuccessGroundedness', () => {
  let wrapper;

  const inspectionDataMock = {
    groundedness: [
      { sentence: 'First sentence', score: 85 },
      { sentence: 'Second sentence', score: 50 },
      { sentence: 'Third sentence', score: 15 },
    ],
  };

  const createWrapper = (props = {}) => {
    wrapper = shallowMount(ResponseSuccessGroundedness, {
      props: {
        inspectionData: inspectionDataMock,
        ...props,
      },
    });
  };

  beforeEach(() => {
    createWrapper();
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders the component successfully', () => {
    const responseSuccessGroundedness = wrapper.find(
      '[data-testid="response-success-groundedness"]',
    );
    expect(responseSuccessGroundedness.exists()).toBe(true);
  });

  it('passes correctly props to TextSentences', () => {
    const textSentences = wrapper.findComponent(TextSentences);
    expect(textSentences.exists()).toBe(true);

    expect(textSentences.props('fragments')).toEqual(
      wrapper.vm.groundednessFragments,
    );
  });

  it('passes correctly props to GroundednessSources', () => {
    const groundednessSources = wrapper.findComponent(GroundednessSources);
    expect(groundednessSources.exists()).toBe(true);

    expect(groundednessSources.props('fragments')).toEqual(
      wrapper.vm.groundednessFragments,
    );
  });

  it('computes groundednessFragments correctly', () => {
    const groundednessFragments = wrapper.vm.groundednessFragments;

    const expectedFragments = inspectionDataMock.groundedness.map(
      (fragment, index) => ({
        ...fragment,
        sentence:
          index === 0
            ? `“${fragment.sentence}`
            : index === inspectionDataMock.groundedness.length - 1
              ? `${fragment.sentence}”`
              : fragment.sentence,
      }),
    );

    expect(groundednessFragments).toEqual(expectedFragments);
  });

  it('provides the correct getReliabilityLevel function to child components', () => {
    const groundednessSources = wrapper.findComponent(GroundednessSources);
    expect(groundednessSources.props('getReliabilityLevel')).toBe(
      wrapper.vm.getReliabilityLevel,
    );

    const reliabilityLevels = [
      { score: 0, expected: 'unreliable' },
      { score: 20, expected: 'slightly-reliable' },
      { score: 50, expected: 'moderately-reliable' },
      { score: 85, expected: 'highly-reliable' },
      { score: 110, expected: 'unreliable' },
    ];

    reliabilityLevels.forEach(({ score, expected }) => {
      const result = wrapper.vm.getReliabilityLevel({ score });
      expect(result).toBe(expected);
    });
  });
});
