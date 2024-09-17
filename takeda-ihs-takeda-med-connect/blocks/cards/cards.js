/* eslint-disable import/no-named-default */
import { default as icon } from './icon.js';
import { default as product } from './product.js';
import { default as iconCta } from './icon-cta.js';
import { default as profile } from './profile.js';
import { default as cta } from './cta.js';
/* eslint-enable import/no-named-default */

export default async function decorate(block) {
  if (block.classList.contains('icon')) {
    await icon(block);
  } else if (block.classList.contains('icon-cta')) {
    await iconCta(block);
  } else if (block.classList.contains('product')) {
    await product(block);
  } else if (block.classList.contains('profile')) {
    await profile(block);
  } else if (block.classList.contains('cta')) {
    await cta(block);
  } else {
    block.classList.add('default');
  }
}
