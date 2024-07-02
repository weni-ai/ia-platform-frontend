import { shallowMount, createLocalVue } from '@vue/test-utils';
import FormGenerator from '@/components/form-generator/FormGenerator';
import Buefy from 'buefy';

// Cria uma instância local do Vue e usa Buefy como plugin
const localVue = createLocalVue();
localVue.use(Buefy);

describe('FormGenerator', () => {
  it('deve renderizar o componente', () => {
    // Define um esquema mínimo para o teste
    const schema = {
      name: {
        type: 'string',
        label: 'Name',
      },
      email: {
        type: 'email',
        label: 'Email',
      },
    };

    // Monta o componente com propriedades mínimas necessárias
    const wrapper = shallowMount(FormGenerator, {
      localVue,
      propsData: {
        schema: schema,
        initialData: {},
        errors: {},
      },
    });

    // Verifica se o componente foi montado corretamente
    expect(wrapper.exists()).toBe(true);
  });
});
