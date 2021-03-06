import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { ValidatedTextInput } from './text-validated';
import { TextInput } from './text';
import { SelectInput } from './select';
import { Button } from './button';
import { ValidatedSelectInput } from './select-validated';

const TabularInputTable = styled.table``;

const TabularInputTableHead = styled.thead`
  font-size: 0.7em;
  width: 100%;
`;

const TabularInputTableHeadCell = styled.th`
  text-align: left;
`;

const TabularInputTableBody = styled.tbody``;

const TabularInputTableRow = styled.tr`
  width: 100%;
`;

const TabularInputTableCell = styled.td`
  input[type='text'] {
    width: auto !important;
  }
`;

const TabularInputTableFoot = styled.tfoot``;

function renderInput(input) {
  switch (input.type) {
    case 'validated-text':
      return <ValidatedTextInput key={input.name} {...input} />;

    case 'text':
      return <TextInput key={input.name} {...input} />;

    case 'validated-select':
      return <ValidatedSelectInput key={input.name} {...input} />;

    case 'select':
      return <SelectInput key={input.name} {...input} />;

    default:
      return <></>;
  }
}

export function TabularInput({ columns, rows, onAddRow, onRemoveRow, onUpdateRow }) {
  const ref = useRef();
  const defaultState = Object.values(columns).reduce(function(acc, cur) {
    acc[cur.name] = cur.value;
    return acc;
  }, {});
  const [state, setState] = useState(defaultState);

  const onChange = function(ev) {
    const { name, value } = ev.target;
    setState(function(prev) {
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const addRow = function(ev) {
    onAddRow(state);
    ref.current.querySelector('#first').focus();
    ev.preventDefault();
    ev.stopPropagation();
    setState(defaultState);
  };

  const onFooterLastCellKeyDown = ev => {
    if (ev.key === 'Tab') {
      addRow(ev);
    }
  };

  const onAddClick = ev => {
    addRow(ev);
  };

  const onRemoveClick = i => ev => {
    onRemoveRow(rows[i]);
  };

  const onRowChange = function(i) {
    return function(ev) {
      const row = rows[i];
      row[ev.target.name] = ev.target.value;
      onUpdateRow(i, row);
    };
  };

  return (
    <TabularInputTable>
      <TabularInputTableHead>
        <TabularInputTableRow>
          {columns.map(function(col) {
            return <TabularInputTableHeadCell key={col.name}>{col.label}</TabularInputTableHeadCell>;
          })}
          <TabularInputTableHeadCell />
        </TabularInputTableRow>
      </TabularInputTableHead>
      <TabularInputTableBody>
        {rows.map(function(row, i) {
          return (
            <TabularInputTableRow key={i}>
              {Object.entries(row).map(function([prop, val], j) {
                return (
                  <TabularInputTableCell key={prop}>
                    {renderInput({
                      type: columns[j].type,
                      name: prop,
                      value: val,
                      placeholder: columns[j].placeholder,
                      options: columns[j].options,
                      onChange: onRowChange(i)
                    })}
                  </TabularInputTableCell>
                );
              })}
              <TabularInputTableCell>
                {onRemoveRow ? <Button onClick={onRemoveClick(i)}>Remove</Button> : <></>}
              </TabularInputTableCell>
            </TabularInputTableRow>
          );
        })}
      </TabularInputTableBody>
      {onAddRow ? (
        <TabularInputTableFoot>
          <TabularInputTableRow ref={ref}>
            {columns.map(function(col, i) {
              return (
                <TabularInputTableCell key={col.name}>
                  {renderInput({
                    id: i === 0 ? 'first' : '',
                    type: col.type,
                    name: col.name,
                    value: state[col.name],
                    placeholder: col.placeholder,
                    onChange: onChange,
                    onKeyDown: i === columns.length - 1 ? onFooterLastCellKeyDown : null
                  })}
                </TabularInputTableCell>
              );
            })}
            <TabularInputTableCell>
              <Button onClick={onAddClick}>Add</Button>
            </TabularInputTableCell>
          </TabularInputTableRow>
        </TabularInputTableFoot>
      ) : (
        <></>
      )}
    </TabularInputTable>
  );
}
