/**
 * Stub for @expo/ui/jetpack-compose — Expo Go does not ship the ExpoUI native module.
 * expo-router loads these components for Stack toolbar; no-ops are enough for our app.
 */
const React = require('react');
const { View } = require('react-native');

function passthrough(name) {
  const Comp = ({ children }) =>
    children != null ? React.createElement(React.Fragment, null, children) : null;
  Comp.displayName = name;
  return Comp;
}

const Icon = passthrough('Icon');
const IconButton = passthrough('IconButton');
const Box = passthrough('Box');
const RNHostView = passthrough('RNHostView');
const Host = passthrough('Host');
const Row = passthrough('Row');
const Text = passthrough('Text');
const HorizontalDivider = passthrough('HorizontalDivider');

const DropdownMenuItem = passthrough('DropdownMenuItem');
DropdownMenuItem.Text = passthrough('DropdownMenuItem.Text');
DropdownMenuItem.LeadingIcon = passthrough('DropdownMenuItem.LeadingIcon');
DropdownMenuItem.TrailingIcon = passthrough('DropdownMenuItem.TrailingIcon');

const DropdownMenu = passthrough('DropdownMenu');
DropdownMenu.Trigger = passthrough('DropdownMenu.Trigger');
DropdownMenu.Items = passthrough('DropdownMenu.Items');

module.exports = {
  Icon,
  IconButton,
  Box,
  RNHostView,
  Host,
  Row,
  Text,
  HorizontalDivider,
  DropdownMenu,
  DropdownMenuItem,
  View,
};
