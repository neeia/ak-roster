export default function attachSubComponents<
  C extends React.ComponentType<any>,
  O extends Record<string, React.ComponentType<any>>
>(displayName: string, topLevelComponent: C, otherComponents: O): C & O {
  topLevelComponent.displayName = displayName;
  Object.entries(otherComponents).forEach(
    ([tag, component]) => (component.displayName = `${displayName}.${tag}`)
  );

  return Object.assign(topLevelComponent, otherComponents);
}
