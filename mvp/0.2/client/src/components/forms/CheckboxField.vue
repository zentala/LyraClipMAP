<template>
  <Field 
    v-slot="{ field, errorMessage, meta }"
    :name="name"
    :validateOnBlur="validateOnBlur"
    :validateOnChange="validateOnChange"
    :validateOnInput="validateOnInput"
    :validateOnModelUpdate="validateOnModelUpdate"
    v-bind="$attrs"
    type="checkbox"
  >
    <v-checkbox
      v-bind="field"
      v-bind="$attrs"
      :label="label"
      :hint="hint"
      :error-messages="errorMessage"
      :class="{ 'is-invalid': errorMessage, 'is-valid': meta.valid && meta.touched }"
      :disabled="disabled || isSubmitting"
      :loading="isSubmitting"
      :hide-details="hideDetails"
    >
      <template v-if="$slots.label" v-slot:label>
        <slot name="label"></slot>
      </template>
      
      <template v-if="$slots.error" v-slot:error>
        <slot name="error"></slot>
      </template>
      
      <template v-if="$slots.message" v-slot:message>
        <slot name="message"></slot>
      </template>
    </v-checkbox>
  </Field>
</template>

<script lang="ts" setup>
import { Field } from 'vee-validate';

defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: false,
    default: ''
  },
  hint: {
    type: String,
    required: false,
    default: ''
  },
  hideDetails: {
    type: Boolean,
    required: false,
    default: false
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  isSubmitting: {
    type: Boolean,
    required: false,
    default: false
  },
  validateOnBlur: {
    type: Boolean,
    required: false,
    default: true
  },
  validateOnChange: {
    type: Boolean,
    required: false,
    default: true
  },
  validateOnInput: {
    type: Boolean,
    required: false,
    default: false
  },
  validateOnModelUpdate: {
    type: Boolean,
    required: false,
    default: true
  }
});
</script>