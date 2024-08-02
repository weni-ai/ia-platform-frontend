import { mount } from '@vue/test-utils';
import IntelligenceTab from '@/components/repository/CreateRepository/IntelligenceTab.vue';

describe('IntelligenceTab', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(IntelligenceTab, {
      props: {
        name: '',
        description: '',
        repositoryType: '',
      },
      global: {
        stubs: {
          UnnnicFormElement: true,
          UnnnicInput: true,
          UnnnicCard: true,
        },
      },
    });
  });

  test('renders form elements with correct labels and placeholders', () => {
    const formElements = wrapper.findAllComponents(
      '.create-intelligence__form-element',
    );
    const inputs = wrapper.findAllComponents({ name: 'UnnnicInput' });

    expect(formElements).toHaveLength(2);
    expect(inputs).toHaveLength(2);

    expect(formElements[0].text()).toBe(
      wrapper.vm.$t('webapp.create_repository.intelligence_name_label'),
    );
    expect(inputs[0].attributes('placeholder')).toBe(
      wrapper.vm.$t('webapp.create_repository.intelligence_name_placeholder'),
    );
    expect(inputs[0].attributes('maxlength')).toBe('64');

    expect(formElements[1].text()).toBe(
      wrapper.vm.$t('webapp.create_repository.description_label'),
    );
    expect(inputs[1].attributes('placeholder')).toBe(
      wrapper.vm.$t('webapp.create_repository.description_placeholder'),
    );
  });

  test('renders intelligence type cards correctly', () => {
    const cards = wrapper.findAllComponents({ name: 'UnnnicCard' });

    expect(cards).toHaveLength(2);

    expect(cards[0].attributes('title')).toBe(
      wrapper.vm.$t(
        'webapp.create_repository.intelligence_type_classification_title',
      ),
    );
    expect(cards[0].attributes('description')).toBe(
      wrapper.vm.$t(
        'webapp.create_repository.intelligence_type_classification_description',
      ),
    );
    expect(cards[0].attributes('type')).toBe('content');
    expect(cards[0].attributes('icon')).toBe('typing-1');
    expect(cards[0].attributes('enabled')).toBe('false');

    expect(cards[1].attributes('title')).toBe(
      wrapper.vm.$t('webapp.create_repository.intelligence_type_content_title'),
    );
    expect(cards[1].attributes('description')).toBe(
      wrapper.vm.$t(
        'webapp.create_repository.intelligence_type_content_description',
      ),
    );
    expect(cards[1].attributes('type')).toBe('content');
    expect(cards[1].attributes('icon')).toBe('paginate-filter-text-1');
    expect(cards[1].attributes('enabled')).toBe('false');
  });

  test('emits update:name event when input value changes', async () => {
    const input = wrapper.findComponent({ name: 'UnnnicInput' });
    await input.vm.$emit('update:model-value', 'New Intelligence Name');

    expect(wrapper.emitted('update:name')).toBeTruthy();
    expect(wrapper.emitted('update:name')[0]).toEqual([
      'New Intelligence Name',
    ]);
  });

  test('emits update:description event when input value changes', async () => {
    const input = wrapper.findAllComponents({ name: 'UnnnicInput' }).at(1);
    await input.vm.$emit('update:model-value', 'New Description');

    expect(wrapper.emitted('update:description')).toBeTruthy();
    expect(wrapper.emitted('update:description')[0]).toEqual([
      'New Description',
    ]);
  });

  test('emits update:repositoryType event when classification card is clicked', async () => {
    const card = wrapper.findAllComponents({ name: 'UnnnicCard' }).at(0);
    await card.trigger('click');

    expect(wrapper.emitted('update:repositoryType')).toBeTruthy();
    expect(wrapper.emitted('update:repositoryType')[0]).toEqual(['classifier']);
  });

  test('emits update:repositoryType event when content card is clicked', async () => {
    const card = wrapper.findAllComponents({ name: 'UnnnicCard' }).at(1);
    await card.trigger('click');

    expect(wrapper.emitted('update:repositoryType')).toBeTruthy();
    expect(wrapper.emitted('update:repositoryType')[0]).toEqual(['content']);
  });

  test('updates card enabled state based on repositoryType prop', async () => {
    await wrapper.setProps({ repositoryType: 'classifier' });
    const cards = wrapper.findAllComponents({ name: 'UnnnicCard' });
    expect(cards[0].attributes('enabled')).toBe('true');
    expect(cards[1].attributes('enabled')).toBe('false');

    await wrapper.setProps({ repositoryType: 'content' });
    expect(cards[0].attributes('enabled')).toBe('false');
    expect(cards[1].attributes('enabled')).toBe('true');
  });
});
