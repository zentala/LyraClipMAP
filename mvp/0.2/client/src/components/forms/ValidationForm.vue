<template>
  <Form
    v-slot="{ errors, isSubmitting, handleSubmit }"
    :validation-schema="schema"
    :initial-values="initialValues"
    @submit="onSubmit"
  >
    <slot :errors="errors" :is-submitting="isSubmitting"></slot>
  </Form>
</template>

<script lang="ts" setup>
import { Form } from 'vee-validate';
import { toRef } from 'vue';

const props = defineProps<{
  schema: Record<string, any>;
  initialValues?: Record<string, any>;
  onSubmit: (values: any) => void | Promise<void>;
}>();

const schema = toRef(props, 'schema');
const initialValues = toRef(props, 'initialValues');
</script>