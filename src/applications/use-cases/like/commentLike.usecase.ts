import { CommentLikeM } from "../../../domains/model/commentLike";
import { CommentRepository } from "../../../domains/repositories/comment/comment.repository";
import { UserRepository } from "../../../domains/repositories/user/user.repository";
import { CommentLikeRepositoryFirebase } from "../../../infrastructure/repositories/like/commentLike.repository";


export class CommentLikeUsecase {
  constructor(
    private userRepository: UserRepository,
    private commentRepository: CommentRepository,
    private commentLikeRepository: CommentLikeRepositoryFirebase
  ){}

  async execute(commentId: string, userId: string) {
    await this.commentRepository.verifyCommentAvailability(commentId);
    const isCommentLiked = await this.commentLikeRepository.verifyIsCommentLiked(userId, commentId);
    if (!isCommentLiked) {
    const commentLike = new CommentLikeM()
    commentLike.user = await this.userRepository.findUser({ id: userId });
    commentLike.comment = await this.commentRepository.getCommentById(commentId);
    await this.commentLikeRepository.createCommentLike(commentLike);
    return 'Comment Liked Successfully';
    } else {
      await this.commentLikeRepository.deleteCommentLike(userId, commentId);
      return 'Comment Unliked Successfully';
    }
  }
}