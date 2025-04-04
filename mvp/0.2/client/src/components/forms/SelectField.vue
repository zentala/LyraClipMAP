<template>
  <Field 
    v-slot="{ field, errorMessage, meta }"
    :name="name"
    :validateOnBlur="validateOnBlur"
    :validateOnChange="validateOnChange"
    :validateOnInput="validateOnInput"
    :validateOnModelUpdate="validateOnModelUpdate"
    v-bind="$attrs"
  >
    <v-select
      v-bind="field"
      v-bind="$attrs"
      :label="label"
      :placeholder="placeholder"
      :hint="hint"
      :items="items"
      :item-value="itemValue"
      :item-title="itemTitle"
      :error-messages="errorMessage"
      :class="{ 'is-invalid': errorMessage, 'is-valid': meta.valid && meta.touched }"
      :disabled="disabled || isSubmitting"
      :loading="isSubmitting"
      :multiple="multiple"
      :chips="chips"
      :clearable="clearable"
    >
      <template v-if="$slots.prepend" v-slot:prepend>
        <slot name="prepend"></slot>
      </template>
      
      <template v-if="$slots['prepend-inner']" v-slot:prepend-inner>
        <slot name="prepend-inner"></slot>
      </template>
      
      <template v-if="$slots.append" v-slot:append>
        <slot name="append"></slot>
      </template>
      
      <template v-if="$slots['append-inner']" v-slot:append-inner>
        <slot name="append-inner"></slot>
      </template>
      
      <template v-if="$slots.item" v-slot:item="slotProps">
        <slot name="item" v-bind="slotProps"></slot>
      </template>
      
      <template v-if="$slots.chip" v-slot:chip="slotProps">
        <slot name="chip" v-bind="slotProps"></slot>
      </template>
      
      <template v-if="$slots['no-data']" v-slot:no-data>
        <slot name="no-data"></slot>
      </template>
    </v-select>
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
  placeholder: {
    type: String,
    required: false,
    default: ''
  },
  hint: {
    type: String,
    required: false,
    default: ''
  },
  items: {
    type: Array,
    required: true
  },
  itemValue: {
    type: String,
    required: false,
    default: 'value'
  },
  itemTitle: {
    type: String,
    required: false,
    default: 'text'
  },
  multiple: {
    type: Boolean,
    required: false,
    default: false
  },
  chips: {
    type: Boolean,
    required: false,
    default: false
  },
  clearable: {
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