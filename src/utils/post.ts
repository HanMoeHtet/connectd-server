import { BAD_REQUEST } from '@src/constants';
import { RequestError } from '@src/http/error-handlers/handler';
import Post, { PostDocument, PostType } from '@src/resources/post/post.model';
import i18next from '@src/services/i18next';

export const findPost = async (postId?: string) => {
  if (!postId) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('missing', { field: 'postId' })
    );
  }

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    throw new RequestError(BAD_REQUEST, i18next.t('httpError.500'), err);
  }

  if (!post) {
    throw new RequestError(
      BAD_REQUEST,
      i18next.t('notFound', { field: 'post' })
    );
  }

  return post;
};

export const preparePost = (post: PostDocument) => {
  const {
    _id,
    userId,
    type,
    privacy,
    content,
    reactionCounts,
    reactionIds,
    commentCount,
    shareCount,
    createdAt,
    user,
  } = post;

  return {
    _id,
    userId,
    type,
    privacy,
    content,
    reactionCounts,
    reactionIds,
    commentCount,
    shareCount,
    createdAt,
    user,
  };
};

export const prepareShare = (post: PostDocument) => {
  return {
    ...preparePost(post),
    source: post.type === PostType.SHARE ? post.source : undefined,
  };
};

interface PrepareUpdatedFieldsInPostAdditionalFields {
  userReactedReactionType?: string;
}
export const prepareUpdatedFieldsInPost = (
  post: PostDocument,
  additionalFields?: PrepareUpdatedFieldsInPostAdditionalFields
) => {
  return {
    _id: post._id,
    content: post.content,
    privacy: post.privacy,
    reactionCounts: post.reactionCounts,
    commentCount: post.commentCount,
    shareCount: post.shareCount,
    ...additionalFields,
  };
};
