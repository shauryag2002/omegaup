<template>
  <div ref="cmEditor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/merge/merge.css';

require('../../../../third_party/js/diff_match_patch.js');
require('codemirror/addon/merge/merge.js');

// Jest does not quite handle imports the same way that webpack does (since
// webpack bundles everything directly, and Jest uses Node's `require`), so the
// place where the `MergeView` is located changes between regular compilation
// and tests.
const MergeView =
  CodeMirror.MergeView ?? (CodeMirror as any)?.default.MergeView;

const props = defineProps<{
  left: string;
  right: string;
}>();

const cmEditor = ref<HTMLElement | null>(null);
let editor: CodeMirror.MergeView.MergeViewEditor | null = null;

onMounted(() => {
  if (editor || !cmEditor.value) return;
  editor = MergeView(cmEditor.value, {
    collapseIdentical: true,
    connect: 'align',
    lineNumbers: true,
    mode: 'text/plain',
    orig: props.right,
    origRight: props.left,
    readOnly: true,
    revertButtons: false,
    showDifferences: true,
    tabSize: 2,
    value: props.right,
  });
});
</script>
