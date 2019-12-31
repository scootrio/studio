import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as monaco from 'monaco-editor';
import useWorkspaceContext from '~components/workspace/context';

const CodeDetailsRoot = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  position: relative;
  height: 100%;
`;

const Editor = styled.div`
  flex-grow: 1;
`;

export default function ComputeCodeDetailsPanel() {
  const {
    selected,
    actions: { setObjectConfig }
  } = useWorkspaceContext();

  const { code, language } = selected.config;

  const ref = useRef();
  useEffect(() => {
    function resize() {
      document.editor.monaco.layout();
    }
    if (!document.editor) {
      let el = document.createElement('div');
      el.style.width = '99%';
      el.style.height = '99%';
      el.style.position = 'relative';

      let editor = monaco.editor.create(el, {
        minimap: {
          enabled: false
        }
      });

      editor.addAction({
        id: 'save',
        label: 'Save',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        precondition: null,
        keybindingContext: null,
        run: function(ed) {
          setObjectConfig(document.editor.id, { code: ed.getValue() });
        }
      });

      document.editor = {
        el,
        monaco: editor
      };

      document.addEventListener('split-resize', resize);
    }
    return () => {
      setObjectConfig(document.editor.id, { code: document.editor.monaco.getValue() });
      document.removeEventListener('split-resize', resize);
      document.editor.id = null;
    };
  }, []);

  useEffect(() => {
    document.editor.id = selected.id;
    document.editor.monaco.setValue(code);
    monaco.editor.setModelLanguage(document.editor.monaco.getModel(), language);

    ref.current.appendChild(document.editor.el);
    document.editor.monaco.layout();
  }, [selected, code, language]);

  return (
    <CodeDetailsRoot>
      <Editor ref={ref}></Editor>
    </CodeDetailsRoot>
  );
}