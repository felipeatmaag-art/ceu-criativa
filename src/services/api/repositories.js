import { createEntityRepository } from '@/services/api/createEntityRepository';
import { dataProvider } from '@/services/api/dataProvider';

export const entityRepository = (name) => createEntityRepository(name, dataProvider);

export const products = entityRepository('Product');
export const designs = entityRepository('Design');
export const competitions = entityRepository('Competition');
export const orders = entityRepository('Order');
export const collections = entityRepository('Collection');
export const rewards = entityRepository('Reward');
export const rewardRedemptions = entityRepository('RewardRedemption');
export const comments = entityRepository('Comment');
export const follows = entityRepository('Follow');
export const likes = entityRepository('Like');
export const loyaltyPoints = entityRepository('LoyaltyPoint');
export const users = entityRepository('User');