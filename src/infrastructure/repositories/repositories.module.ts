import { Module } from '@nestjs/common';
import { FirebaseModule } from '../config/firebase/firebase.module';
import { UserRepositoryFirebase } from './user/user.repository';
import { AuthRepositoryFirebase } from './auth/auth.repository';
import { PostRepositoryFirestore } from './posts/post.repository';
import { CommentRepositoryFirebase } from './comment/comment.repository';
import { ReplyRepositoryFirebase } from './reply/reply.repository';
import { PostLikeRepositoryFirebase } from './like/postLike.repository';
import { CommentLikeRepositoryFirebase } from './like/commentLike.repository';
import { ReplyLikeRepositoryFirebase } from './like/replyLike.repository';
import { FollowRepositoryFirebase } from './follow/follow.repository';
import { HashTagRepositoryFirestore } from './hashtag/hashtag.repository';
import { MessageRepositoryFirebase } from './message/message.repository';
import { SubscriptionRepositoryFirebase } from './subcription/subscription.repository';


@Module({
  imports: [
    FirebaseModule
  ],
  providers: [
    UserRepositoryFirebase,
    AuthRepositoryFirebase,
    PostRepositoryFirestore,
    HashTagRepositoryFirestore,
    PostLikeRepositoryFirebase,
    CommentRepositoryFirebase,
    CommentLikeRepositoryFirebase,
    ReplyRepositoryFirebase,
    ReplyLikeRepositoryFirebase,
    FollowRepositoryFirebase,
    MessageRepositoryFirebase,
    SubscriptionRepositoryFirebase,
  ],
  exports: [
    UserRepositoryFirebase,
    AuthRepositoryFirebase,
    PostRepositoryFirestore,
    HashTagRepositoryFirestore,
    PostLikeRepositoryFirebase,
    CommentRepositoryFirebase,
    CommentLikeRepositoryFirebase,
    ReplyRepositoryFirebase,
    ReplyLikeRepositoryFirebase,
    FollowRepositoryFirebase,
    MessageRepositoryFirebase,
    SubscriptionRepositoryFirebase,
  ],
})
export class RepositoriesModule {}
