import React, { useContext, useState } from 'react';
import { Compute, EventInternal, EventExternal, Trigger, Reference } from '~types';

const WorkspaceContext = React.createContext();

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      'Failed to get workspace context: You can only call `useWorkspaceContext` from inside a ' +
        '`WorkspaceContextProvider`. Make sure you have the provider higher up in the component tree.'
    );
  }
  return context;
}

function mergeResourceConfiguration(prev, id, config) {
  const resources = {
    ...prev.resources,
    [id]: {
      ...prev.resources[id],
      config: {
        ...prev.resources[id].config,
        ...config
      }
    }
  };
  return resources;
}

function mergeConnectionConfiguration(prev, id, config) {
  const connections = {
    ...prev.connections,
    [id]: {
      ...prev.connections[id],
      config: {
        ...prev.connections[id].config,
        ...config
      }
    }
  };
  return connections;
}

export function WorkspaceContextProvider({ children }) {
  const [state, setState] = useState({
    selected: null,
    resources: {},
    connections: {}
  });

  const actions = {
    setSelected: function(val) {
      setState(function(prev) {
        if (val === null) return { ...prev, selected: null };
        if (!val.meta || !val.meta.id) {
          throw new Error(
            'Failed to set value for `selected` in the WorkspaceContext: The provided value does not have a meta ID'
          );
        }
        const id = val.meta.id;
        if (prev.resources[id]) return { ...prev, selected: prev.resources[id] };
        if (prev.connections[id]) return { ...prev, selected: prev.connections[id] };
        throw new Error(
          'Failed to set value for `selected` in the WorkspaceContext: The provided meta ID was not found'
        );
      });
    },

    updateSelectedConfiguration: function(config) {
      setState(function(prev) {
        if (prev.selected) {
          const id = prev.selected.meta.id;
          if (prev.resources[id]) {
            const resources = mergeResourceConfiguration(prev, id, config);
            return {
              ...prev,
              resources,
              selected: resources[id]
            };
          } else if (prev.connections[id]) {
            const connections = mergeConnectionConfiguration(prev, id, config);
            return {
              ...prev,
              connections,
              selected: connections[id]
            };
          } else {
            throw new Error(
              'Failed to update selected configuration: The meta ID "' +
                id +
                '" could not be found in the current state. This indicates a state corruption occurring somewhere ' +
                'else in the context.'
            );
          }
        } else {
          return prev;
        }
      });
      if (state.selected) {
        const id = state.selected.meta.id;
        if (state.resources[id]) return actions.updateResourceConfiguration(id, config);
        if (state.connections[id]) return actions.updateConnectionConfiguration(id, config);
      }
    },

    addResource: function(resource) {
      setState(function(prev) {
        const resources = {
          ...prev.resources,
          [resource.meta.id]: resource
        };
        return {
          ...prev,
          resources,
          selected: resources[resource.meta.id]
        };
      });
    },

    updateResourceConfiguration: function(id, config) {
      setState(function(prev) {
        const resources = mergeResourceConfiguration(prev, id, config);
        return {
          ...prev,
          resources,
          selected: resources[prev.selected.meta.id] ? resources[prev.selected.meta.id] : prev.selected
        };
      });
    },

    removeResource: function(id) {
      setState(function(prev) {
        // Remove the resource
        const { [id]: omit, ...resources } = prev.resources;

        // Remove any connections attached to the resource
        const connections = {};
        const removedConnections = [];
        Object.values(prev.connections).forEach(conn => {
          if (conn.config.source.meta.id === id || conn.config.target.meta.id === id) {
            removedConnections.push(conn.meta.id);
          } else {
            connections[conn.meta.id] = { ...conn };
          }
        });

        // Update the selected JS object reference (if necessary)
        let selected = prev.selected;
        if (selected) {
          if (selected.meta.id === id || removedConnections.includes(selected.meta.id)) {
            selected = null;
          } else if (resources[selected.meta.id]) {
            // Preventing memory leaks by removing the reference to the old JS object
            selected = resources[selected.meta.id];
          } else {
            // Preventing memory leaks by removing the reference to the old JS object
            selected = connections[selected.meta.id];
          }
        }

        return {
          ...prev,
          resources,
          connections,
          selected
        };
      });
    },

    addConnection: function(connection, shouldSelect = true) {
      setState(function(prev) {
        const connections = {
          ...prev.connections,
          [connection.meta.id]: connection
        };

        let selected = prev.selected;
        if (shouldSelect) {
          selected = connections[connection.meta.id];
        } else if (selected && prev.connections[selected.meta.id]) selected = connections[selected.meta.id];

        return {
          ...prev,
          connections,
          selected
        };
      });
    },

    updateConnectionConfiguration: function(id, config) {
      setState(function(prev) {
        const connections = mergeConnectionConfiguration(prev, id, config);
        return {
          ...prev,
          connections,
          selected: connections[prev.selected.meta.id] ? connections[prev.selected.meta.id] : prev.selected
        };
      });
    },

    removeConnection: function(id) {
      setState(function(prev) {
        // Remove the connection
        const { [id]: omit, ...connections } = prev.connections;

        // Update the selected JS object reference if necessary
        let selected = null;
        if (selected && prev.selected.meta.id !== id) {
          selected = connections[prev.selected.meta.id] || prev.resources[prev.selected.meta.id];
        }
        return {
          ...prev,
          connections,
          selected
        };
      });
    },

    mergeDeploymentResults: function(results) {}
  };

  const pack = function() {
    const pkg = {
      compute: [],
      storage: [],
      events: {
        internal: [],
        external: []
      },
      triggers: [],
      references: []
    };

    // Pack the resources according to their types
    Object.values(state.resources).forEach(function(resource) {
      switch (resource.meta.type) {
        case Compute:
          pkg.compute.push(resource.config);
          break;

        case Storage:
          pkg.storage.push(resource.config);
          break;

        case EventInternal:
          pkg.events.internal.push(resource.config);

        case EventExternal:
          pkg.events.external.push(resource.config);
          break;

        default:
          throw new Error(
            'Failed to pack resources for deployment: A resource with an invalid type "' +
              resource.meta.type +
              '" was encountered during packing. This indicates state corruption occurring elsewhere in the context.'
          );
      }
    });

    // Pack the connections according to their types
    Object.values(state.connections).forEach(function(connection) {
      switch (connection.meta.type) {
        case Trigger:
          pkg.triggers.push(connection.config);
          break;

        case Reference:
          pkg.references.push(connection.config);
          break;

        default:
          throw new Error(
            'Failed to pack connections for deployment: A connection with an invalid type "' +
              connection.meta.type +
              '" was encountered during packing. This indicates state corruption occurring elsewhere in the context.'
          );
      }
    });

    return pkg;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        state,
        actions,
        pack
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}