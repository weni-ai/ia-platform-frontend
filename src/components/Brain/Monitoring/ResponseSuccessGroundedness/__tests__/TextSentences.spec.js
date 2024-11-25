import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import TextSentences from '../TextSentences.vue';

describe('TextSentences.vue', () => {
  let wrapper;

  const fragmentsMock = [
    {
      sentence: 'This is slightly reliable.',
      reliability: 'slightly-reliable',
    },
    {
      sentence: 'This is moderately reliable.',
      reliability: 'moderately-reliable',
    },
    { sentence: 'This is highly reliable.', reliability: 'highly-reliable' },
  ];

  const getReliabilityLevelMock = vi.fn((fragment) => fragment.reliability);

  const mountWrapper = (props = {}) => {
    wrapper = shallowMount(TextSentences, {
      props: {
        fragments: fragmentsMock,
        getReliabilityLevel: getReliabilityLevelMock,
        ...props,
      },
    });
  };

  beforeEach(() => {
    mountWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const sentences = () => wrapper.findAll('[data-testid="sentence-text"]');

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders a section with the correct class', () => {
    const sentencesContainer = wrapper.find('[data-testid="sentences"]');
    expect(sentencesContainer.exists()).toBe(true);
  });

  it('renders the correct number of sentences for each fragment', () => {
    expect(sentences().length).toBe(fragmentsMock.length);
  });

  it('renders each sentence correctly', () => {
    sentences().forEach((sentence, index) => {
      expect(sentence.text()).toBe(fragmentsMock[index].sentence);
    });
  });

  it('applies the correct dynamic class for each fragment', () => {
    sentences().forEach((sentence, index) => {
      const reliabilityClass = `text-sentences__text--${fragmentsMock[index].reliability}`;
      expect(sentence.classes()).toContain(reliabilityClass);
    });
  });

  it('calls getReliabilityLevel for each fragment', () => {
    expect(getReliabilityLevelMock).toHaveBeenCalledTimes(fragmentsMock.length);
    fragmentsMock.forEach((fragment) => {
      expect(getReliabilityLevelMock).toHaveBeenCalledWith(fragment);
    });
  });

  it('renders no sentence when fragments are empty', async () => {
    await wrapper.setProps({ fragments: [] });
    expect(sentences().length).toBe(0);
  });

  it('renders different reliability levels correctly', () => {
    const reliabilityClasses = [
      'text-sentences__text--slightly-reliable',
      'text-sentences__text--moderately-reliable',
      'text-sentences__text--highly-reliable',
    ];
    sentences().forEach((sentence, index) => {
      expect(sentence.classes()).toContain(reliabilityClasses[index]);
    });
  });
});
