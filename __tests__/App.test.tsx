/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

beforeEach(() => {
  (globalThis as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders correctly', async () => {
  let renderer: any;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer).toBeDefined();
});

