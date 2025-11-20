import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { EnvironmentConfigModule } from '../config/environment-config/environment-config.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { UserRepositoryFirebase } from '../repositories/user/user.repository';
import { UseCaseProxy } from './usecase-proxy';
import { RegisterUserUsecase } from '../../applications/use-cases/user/registerUser.usecase';

import * as argon2 from 'argon2';
import Argon2PasswordHash from '../Argon2Passwordhash';
import { JwtTokenManager } from '../JwtTokenManager';
import { LoginUserUsecase } from '../../applications/use-cases/user/loginUser.usecase';
import { CurrUserUsecase } from '../../applications/use-cases/user/currUser.usecase';
import { PostRepositoryFirestore } from '../repositories/posts/post.repository';
import { PostMediaUsecase } from '../../applications/use-cases/posts/postMedia.usecase';
import { CommentRepositoryFirebase } from '../repositories/comment/comment.repository';
import { PostCommentUsecase } from '../../applications/use-cases/comment/postComment.usecase';
import { ReplyRepositoryFirebase } from '../repositories/reply/reply.repository';
import { postReplyUseCase } from '../../applications/use-cases/reply/postReply.usecase';
import { GetMediaDetailsUsecase } from '../../applications/use-cases/posts/getMedia.usecase';
import { PostLikeUsecase } from '../../applications/use-cases/like/postLike.usecase';
import { CommentLikeRepositoryFirebase } from '../repositories/like/commentLike.repository';
import { CommentLikeUsecase } from '../../applications/use-cases/like/commentLike.usecase';
import { ReplyLikeRepositoryFirebase } from '../repositories/like/replyLike.repository';
import { ReplyLikeUsecase } from '../../applications/use-cases/like/replyLike.usecasse';
import { PostLikeRepositoryFirebase } from '../repositories/like/postLike.repository';
import { DeleteMediaUsecase } from '../../applications/use-cases/posts/deleteMedia.usecase';
import { DeleteCommentUsecase } from '../../applications/use-cases/comment/deleteComment.usecase';
import { DeleteReplyUsecase } from '../../applications/use-cases/reply/deleteReply.usecase';
import { GetPaginatedMediaUsecase } from '../../applications/use-cases/posts/getPaginatedMedia.usecase';
import { EditMediaUsecase } from '../../applications/use-cases/posts/editMedia.usecase';
import { EditCommentUsecase } from '../../applications/use-cases/comment/editComment.usecase';
import { EditReplyUsecase } from '../../applications/use-cases/reply/editReply.usecase';
import { GetPaginatedUserMediaUsecase } from '../../applications/use-cases/posts/getPaginatedUserMedia.usecase';
import { FollowRepositoryFirebase } from '../repositories/follow/follow.repository';
import { FollowUserUseCase } from '../../applications/use-cases/follow/followUser.usecase';
import { UnfollowUserUseCase } from '../../applications/use-cases/follow/unfollowUser.usecase';
import { GetUserFollowStatusUsecase } from '../../applications/use-cases/follow/GetUserFollowStatus.usecase';
import { GetUserFollowingUseCase } from '../../applications/use-cases/follow/getUserFollowing.usecase';
import { GetUserFollowerUseCase } from '../../applications/use-cases/follow/getUserFollower.usecase';
import { HashTagRepositoryFirestore } from '../repositories/hashtag/hashtag.repository';
import { GetPaginatedHashtagMediaUsecase } from '../../applications/use-cases/posts/getPaginatedHashtagMedia.usecase';
import { GetPagniatedFollowingMediaUseCase } from '../../applications/use-cases/posts/getPaginatedFollowingMedia.usecase';
import { STORAGE_TOKEN, StorageModule } from '../repositories/storage/storage.module';
import { UploadMediaUseCase } from '../../applications/use-cases/media/uploadMedia.usecase';
import { IGcsStorage } from '../../domains/repositories/storage/IgcsStorage';
import { EditUserUsecase } from '../../applications/use-cases/user/editUser.usecase';
import { MessageRepositoryFirebase } from '../repositories/message/message.repository';
import { CreateMessageUsecase } from '../../applications/use-cases/message/createMessage.usecase';
import { GetMessagesUsecase } from '../../applications/use-cases/message/getMessages.usecase';
import { FirebaseService } from '../repositories/firebase/firebase.service';
import { PushNotificationUsecase } from '../../applications/use-cases/firebase/pushNotification.usecase';
import { EditFCMTokenUsecase } from '../../applications/use-cases/firebase/saveFcmToken.usecase';
import { DeleteFcmTokenUseCase } from '../../applications/use-cases/firebase/deleteFcmToken.usecase';
import { DeleteStorageMediaUseCase } from '../../applications/use-cases/media/deleteStorageMedia.usecase';
import { getUserByIdUsecase } from '../../applications/use-cases/user/getUserById.usecase';
import { MidtransModule, PAYMENT_GATEWAY_TOKEN } from '../repositories/payment-gateway/midtrans.module';
import { CreateSubcriptionPaymentUseCase } from '../../applications/use-cases/payment-gateway/createSubcriptionPayment.usecase';
import { SubscriptionRepositoryFirebase } from '../repositories/subcription/subscription.repository';
import { IMidtrans } from '../../domains/repositories/payment-gateway/IMidTrans';
import { PostSubscriptionUseCase } from '../../applications/use-cases/subscription/postSubscription.usecase';
import { MidtransWebHookUseCase } from '../../applications/use-cases/payment-gateway/midtransWebHook.usecase';
import { GetPostLikeStatusUseCase } from '../../applications/use-cases/like/getPostLikeStatus.usecase';
import { GetCommentLikeStatusUsecase } from '../../applications/use-cases/like/getCommentLikeStatus.usecase';
import { GetReplyLikeStatusUsecase } from '../../applications/use-cases/like/getReplyLikeStatus.usecase';
import { HandleExpiredSubscriptionUseCase } from '../../applications/use-cases/subscription/handleExpiredSubscription.usecase';
import { GetSubscriptionByOrderIdUseCase } from 'src/applications/use-cases/payment-gateway/getSubscriptionByOrderId.usecase';
import { FirebaseModule } from '../config/firebase/firebase.module';

@Module({
  imports: [
    EnvironmentConfigModule,
    RepositoriesModule,
    MidtransModule,
    StorageModule,
    FirebaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class UseCaseProxyModule {
  // usecases
  static LOGIN_USER_USECASE = 'loginUserUsecaseProxy';
  static REGISTER_USER_USECASE = 'registerUserUsecaseProxy';
  static CURRENT_USER_USECASE = 'currentUserUsecaseProxy';
  static GET_USER_BY_ID_USECASE = 'getUserByIdUsecaseProxy';
  static EDIT_USER_USECASE = 'editUserUsecaseProxy';
  static UPLOAD_MEDIA_USECASE = 'uploadMediaUsecaseProxy';
  static DELETE_STORAGE_MEDIA_USECASE = 'deleteStorageMediaUsecaseProxy';
  static POST_MEDIA_USECASE = 'postMediaUsecaseProxy';
  static DELETE_POST_USECASE = 'deletePostUsecaseProxy';
  static EDIT_POST_USECASE = 'editPostUsecaseProxy';
  static POST_LIKE_USECASE = 'postLikeUsecaseProxy';
  static GET_POST_LIKE_STATUS_USECASE = 'getPostLikeStatusUsecaseProxy';
  static GET_PAGINATED_MEDIA_USECASE = 'getPaginatedMediaUsecaseProxy';
  static GET_PAGINATED_USER_MEDIA_USECASE = 'getPaginatedUserMediaUsecaseProxy';
  static GET_PAGINATED_HASHTAG_MEDIA_USECASE =
    'getPaginatedHashtagMediaUsecaseProxy';
  static GET_PAGINATED_FOLLOWING_MEDIA_USECASE =
    'getPaginatedFollowingMediaUsecaseProxy';
  static GET_MEDIA_USECASE = 'getMediaUsecaseProxy';
  static POST_COMMENT_USECASE = 'postCommentUsecaseProxy';
  static EDIT_COMMENT_USECASE = 'editCommentUsecaseProxy';
  static DELETE_COMMENT_USECASE = 'deleteCommentUsecaseProxy';
  static COMMENT_LIKE_USECASE = 'commentLikeUsecaseProxy';
  static GET_COMMENT_LIKE_STATUS_USECASE = 'getCommentLikeStatusUsecaseProxy';
  static POST_REPLY_USECASE = 'postReplyUsecaseProxy';
  static EDIT_REPLY_USECASE = 'editReplyUsecaseProxy';
  static DELETE_REPLY_USECASE = 'deleteReplyUsecaseProxy';
  static REPLY_LIKE_USECASE = 'replyLikeUsecaseProxy';
  static GET_REPLY_LIKE_STATUS_USECASE = 'getReplyLikeStatusUsecaseProxy';
  static FOLLOW_USER_USECASE = 'followUserUsecaseProxy';
  static UNFOLLOW_USER_USECASE = 'unfollowUserUsecaseProxy';
  static GET_USER_FOLLOW_STATUS_USECASE = 'getUserFollowStatusUsecaseProxy';
  static GET_USER_FOLLOWERS_USECASE = 'getUserFollowersUsecaseProxy';
  static GET_USER_FOLLOWING_USECASE = 'getUserFollowingUsecaseProxy';
  static POST_MESSAGE_USECASE = 'postMessageUsecaseProxy';
  static GET_MESSAGES_USECASE = 'getMessagesUsecaseProxy';
  static GET_SUBSCRIPTION_USECASE = 'getSubscriptionUsecaseProxy';
  static POST_SUBSCRIPTION_USECASE = 'postSubscriptionUsecaseProxy';
  static HANDLE_EXPIRED_SUBSCRIPTION_USECASE = 'handleExpiredSubscriptionUsecaseProxy';
  // FCM
  static SEND_NOTIFICATION_USECASE = 'sendNotificationUsecaseProxy';
  static DELETE_FCM_TOKEN_USECASE = 'deleteFcmTokenUsecaseProxy';
  static EDIT_FCM_TOKEN_USECASE = 'editFcmTokenUsecaseProxy';
  // payment gateway
  static CREATE_SUBSCRIPTION_PAYMENT_USECASE = 'createSubcriptionPaymentUsecaseProxy';
  static MIDTRANS_WEBHOOK_USECASE = 'midtransWebHookUsecaseProxy';
  static register(): DynamicModule {
    return {
      module: UseCaseProxyModule,
      providers: [
        FirebaseService,
        // external providers
        {
          provide: Argon2PasswordHash,
          useValue: new Argon2PasswordHash(argon2),
        },
        {
          inject: [JwtService],
          provide: JwtTokenManager,
          useFactory: (jwtService: JwtService) =>
            new JwtTokenManager(jwtService),
        },
        {
          inject:[FirebaseService],
          provide:UseCaseProxyModule.SEND_NOTIFICATION_USECASE,
          useFactory:(firebaseService:FirebaseService) => new UseCaseProxy(new PushNotificationUsecase(firebaseService))
        },
        // registering usecases
        {
          inject: [UserRepositoryFirebase, Argon2PasswordHash],
          provide: UseCaseProxyModule.REGISTER_USER_USECASE,
          useFactory: (
            userRepository: UserRepositoryFirebase,
            passwordHash: Argon2PasswordHash,
          ) =>
            new UseCaseProxy(
              new RegisterUserUsecase(userRepository, passwordHash),
            ),
        },
        {
          inject: [UserRepositoryFirebase, JwtTokenManager, Argon2PasswordHash],
          provide: UseCaseProxyModule.LOGIN_USER_USECASE,
          useFactory: (
            userRepository: UserRepositoryFirebase,
            authTokenManager: JwtTokenManager,
            passwordHash: Argon2PasswordHash,
          ) =>
            new UseCaseProxy(
              new LoginUserUsecase(
                userRepository,
                authTokenManager,
                passwordHash,
              ),
            ),
        },
        {
          inject: [UserRepositoryFirebase, JwtTokenManager],
          provide: UseCaseProxyModule.CURRENT_USER_USECASE,
          useFactory: (
            userRepository: UserRepositoryFirebase,
            authTokenManager: JwtTokenManager,
          ) =>
            new UseCaseProxy(
              new CurrUserUsecase(userRepository, authTokenManager),
            ),
        },
        {
          inject: [UserRepositoryFirebase],
          provide: UseCaseProxyModule.GET_USER_BY_ID_USECASE,
          useFactory: (userRepository: UserRepositoryFirebase) =>
            new UseCaseProxy(new getUserByIdUsecase(userRepository)),
        },
        {
          inject: [UserRepositoryFirebase],
          provide: UseCaseProxyModule.EDIT_USER_USECASE,
          useFactory: (userRepository: UserRepositoryFirebase) =>
            new UseCaseProxy(new EditUserUsecase(userRepository)),
        },
        {
          inject: [STORAGE_TOKEN],
          provide: UseCaseProxyModule.UPLOAD_MEDIA_USECASE,
          useFactory: (gcsStorage: IGcsStorage) =>
            new UseCaseProxy(new UploadMediaUseCase(gcsStorage)),
        },
        {
          inject: [STORAGE_TOKEN],
          provide: UseCaseProxyModule.DELETE_STORAGE_MEDIA_USECASE,
          useFactory: (gcsStorage: IGcsStorage) =>
            new UseCaseProxy(new DeleteStorageMediaUseCase(gcsStorage)),
        },
        {
          inject: [PostRepositoryFirestore, UserRepositoryFirebase, HashTagRepositoryFirestore],
          provide: UseCaseProxyModule.POST_MEDIA_USECASE,
          useFactory: (
            postRepository: PostRepositoryFirestore,
            userRepository: UserRepositoryFirebase,
            hashtagRepository: HashTagRepositoryFirestore,
          ) =>
            new UseCaseProxy(
              new PostMediaUsecase(
                userRepository,
                postRepository,
                hashtagRepository,
              ),
            ),
        },
        {
          inject: [PostRepositoryFirestore],
          provide: UseCaseProxyModule.DELETE_POST_USECASE,
          useFactory: (postRepository: PostRepositoryFirestore) =>
            new UseCaseProxy(new DeleteMediaUsecase(postRepository)),
        },
        {
          inject: [PostRepositoryFirestore, HashTagRepositoryFirestore],
          provide: UseCaseProxyModule.EDIT_POST_USECASE,
          useFactory: (
            postRepository: PostRepositoryFirestore,
            hashtagRepository: HashTagRepositoryFirestore,
          ) =>
            new UseCaseProxy(
              new EditMediaUsecase(postRepository, hashtagRepository),
            ),
        },
        {
          inject: [UserRepositoryFirebase, PostRepositoryFirestore, PostLikeRepositoryFirebase],
          provide: UseCaseProxyModule.POST_LIKE_USECASE,
          useFactory: (
            userRepository: UserRepositoryFirebase,
            postRepository: PostRepositoryFirestore,
            postLikeRepository: PostLikeRepositoryFirebase,
          ) =>
            new UseCaseProxy(
              new PostLikeUsecase(
                userRepository,
                postRepository,
                postLikeRepository,
              ),
            ),
        },
        {
          inject: [PostRepositoryFirestore,PostLikeRepositoryFirebase],
          provide: UseCaseProxyModule.GET_POST_LIKE_STATUS_USECASE,
          useFactory: (postRepository:PostRepositoryFirestore,postLikeRepository: PostLikeRepositoryFirebase) =>
            new UseCaseProxy(new GetPostLikeStatusUseCase(postRepository,postLikeRepository)),
        },
        {
          inject: [PostRepositoryFirestore,PostLikeRepositoryFirebase],
          provide: UseCaseProxyModule.GET_PAGINATED_MEDIA_USECASE,
          useFactory: (postRepository: PostRepositoryFirestore,likeRepository:PostLikeRepositoryFirebase) =>
            new UseCaseProxy(new GetPaginatedMediaUsecase(postRepository,likeRepository)),
        },
        {
          inject: [PostRepositoryFirestore],
          provide: UseCaseProxyModule.GET_PAGINATED_USER_MEDIA_USECASE,
          useFactory: (postRepository: PostRepositoryFirestore) =>
            new UseCaseProxy(new GetPaginatedUserMediaUsecase(postRepository)),
        },
        {
          inject: [PostRepositoryFirestore],
          provide: UseCaseProxyModule.GET_PAGINATED_HASHTAG_MEDIA_USECASE,
          useFactory: (postRepository: PostRepositoryFirestore) =>
            new UseCaseProxy(
              new GetPaginatedHashtagMediaUsecase(postRepository),
            ),
        },
        {
          inject: [PostRepositoryFirestore, FollowRepositoryFirebase, PostLikeRepositoryFirebase],
          provide: UseCaseProxyModule.GET_PAGINATED_FOLLOWING_MEDIA_USECASE,
          useFactory: (
            postRepository: PostRepositoryFirestore,
            followRepository: FollowRepositoryFirebase, 
            postLikeRepository: PostLikeRepositoryFirebase
          ) =>
            new UseCaseProxy(
              new GetPagniatedFollowingMediaUseCase(
                postRepository,
                followRepository,
                postLikeRepository
              ),
            ),
        },
        {
          inject: [PostRepositoryFirestore],
          provide: UseCaseProxyModule.GET_MEDIA_USECASE,
          useFactory: (postRepository: PostRepositoryFirestore) =>
            new UseCaseProxy(new GetMediaDetailsUsecase(postRepository)),
        },
        {
          inject: [PostRepositoryFirestore, UserRepositoryFirebase, CommentRepositoryFirebase],
          provide: UseCaseProxyModule.POST_COMMENT_USECASE,
          useFactory: (
            postRepository: PostRepositoryFirestore,
            userRepository: UserRepositoryFirebase,
            commentRepository: CommentRepositoryFirebase,
          ) =>
            new UseCaseProxy(
              new PostCommentUsecase(
                userRepository,
                postRepository,
                commentRepository,
              ),
            ),
        },
        {
          inject: [CommentRepositoryFirebase],
          provide: UseCaseProxyModule.EDIT_COMMENT_USECASE,
          useFactory: (commentRepository: CommentRepositoryFirebase) =>
            new UseCaseProxy(new EditCommentUsecase(commentRepository)),
        },
        {
          inject: [CommentRepositoryFirebase],
          provide: UseCaseProxyModule.DELETE_COMMENT_USECASE,
          useFactory: (commentRepository: CommentRepositoryFirebase) =>
            new UseCaseProxy(new DeleteCommentUsecase(commentRepository)),
        },
        {
          inject: [
            UserRepositoryFirebase,
            CommentRepositoryFirebase,
            CommentLikeRepositoryFirebase,
          ],
          provide: UseCaseProxyModule.COMMENT_LIKE_USECASE,
          useFactory: (
            userRepository: UserRepositoryFirebase,
            commentRepository: CommentRepositoryFirebase,
            commentLikeRepository: CommentLikeRepositoryFirebase,
          ) =>
            new UseCaseProxy(
              new CommentLikeUsecase(
                userRepository,
                commentRepository,
                commentLikeRepository,
              ),
            ),
        },
        {
          inject: [CommentRepositoryFirebase,CommentLikeRepositoryFirebase],
          provide: UseCaseProxyModule.GET_COMMENT_LIKE_STATUS_USECASE,
          useFactory: (commentRepository: CommentRepositoryFirebase,commentLikeRepository: CommentLikeRepositoryFirebase) =>
            new UseCaseProxy(new GetCommentLikeStatusUsecase(commentRepository,commentLikeRepository)),
        },
        {
          inject: [
            UserRepositoryFirebase,
            PostRepositoryFirestore,
            CommentRepositoryFirebase,
            ReplyRepositoryFirebase,
          ],
          provide: UseCaseProxyModule.POST_REPLY_USECASE,
          useFactory: (
            userRepository: UserRepositoryFirebase,
            postRepository: PostRepositoryFirestore,
            commentRepository: CommentRepositoryFirebase,
            replyRepository: ReplyRepositoryFirebase,
          ) =>
            new UseCaseProxy(
              new postReplyUseCase(
                userRepository,
                postRepository,
                commentRepository,
                replyRepository,
              ),
            ),
        },
        {
          inject: [ReplyRepositoryFirebase],
          provide: UseCaseProxyModule.EDIT_REPLY_USECASE,
          useFactory: (replyRepository: ReplyRepositoryFirebase) =>
            new UseCaseProxy(new EditReplyUsecase(replyRepository)),
        },
        {
          inject: [ReplyRepositoryFirebase],
          provide: UseCaseProxyModule.DELETE_REPLY_USECASE,
          useFactory: (replyRepository: ReplyRepositoryFirebase) =>
            new UseCaseProxy(new DeleteReplyUsecase(replyRepository)),
        },
        {
          inject: [
            UserRepositoryFirebase,
            ReplyRepositoryFirebase,
            ReplyLikeRepositoryFirebase,
          ],
          provide: UseCaseProxyModule.REPLY_LIKE_USECASE,
          useFactory: (
            userRepository: UserRepositoryFirebase,
            replyRepository: ReplyRepositoryFirebase,
            replyLikeRepository: ReplyLikeRepositoryFirebase,
          ) =>
            new UseCaseProxy(
              new ReplyLikeUsecase(
                userRepository,
                replyRepository,
                replyLikeRepository,
              ),
            ),
        },
        {
          inject: [ReplyRepositoryFirebase,ReplyLikeRepositoryFirebase],
          provide: UseCaseProxyModule.GET_REPLY_LIKE_STATUS_USECASE,
          useFactory: (replyRepository: ReplyRepositoryFirebase,replyLikeRepository: ReplyLikeRepositoryFirebase) =>
            new UseCaseProxy(new GetReplyLikeStatusUsecase(replyRepository,replyLikeRepository)),
        },
        {
          inject: [FollowRepositoryFirebase,  UserRepositoryFirebase],
          provide: UseCaseProxyModule.FOLLOW_USER_USECASE,
          useFactory: (
            followRepository: FollowRepositoryFirebase, 
            userRepository: UserRepositoryFirebase,
          ) =>
            new UseCaseProxy(
              new FollowUserUseCase(followRepository, userRepository),
            ),
        },
        {
          inject: [FollowRepositoryFirebase,  UserRepositoryFirebase],
          provide: UseCaseProxyModule.UNFOLLOW_USER_USECASE,
          useFactory: (
            followRepository: FollowRepositoryFirebase, 
            userRepository: UserRepositoryFirebase,
          ) =>
            new UseCaseProxy(
              new UnfollowUserUseCase(followRepository, userRepository),
            ),
        },
        {
          inject: [FollowRepositoryFirebase] ,
          provide: UseCaseProxyModule.GET_USER_FOLLOW_STATUS_USECASE,
          useFactory: (followRepository: FollowRepositoryFirebase)  =>
            new UseCaseProxy(new GetUserFollowStatusUsecase(followRepository)),
        },
        {
          inject: [FollowRepositoryFirebase] ,
          provide: UseCaseProxyModule.GET_USER_FOLLOWING_USECASE,
          useFactory: (followRepository: FollowRepositoryFirebase)  =>
            new UseCaseProxy(new GetUserFollowingUseCase(followRepository)),
        },
        {
          inject: [FollowRepositoryFirebase] ,
          provide: UseCaseProxyModule.GET_USER_FOLLOWERS_USECASE,
          useFactory: (followRepository: FollowRepositoryFirebase)  =>
            new UseCaseProxy(new GetUserFollowerUseCase(followRepository)),
        },
        {
          inject: [MessageRepositoryFirebase, UserRepositoryFirebase],
          provide: UseCaseProxyModule.POST_MESSAGE_USECASE,
          useFactory: (
            messageRepository: MessageRepositoryFirebase,
            userRepository: UserRepositoryFirebase,
          ) =>
            new UseCaseProxy(
              new CreateMessageUsecase(userRepository, messageRepository),
            ),
        },
        {
          inject: [MessageRepositoryFirebase, UserRepositoryFirebase],
          provide: UseCaseProxyModule.GET_MESSAGES_USECASE,
          useFactory: (
            messageRepository: MessageRepositoryFirebase,
            userRepository: UserRepositoryFirebase,
          ) =>
            new UseCaseProxy(
              new GetMessagesUsecase(messageRepository, userRepository),
            ),
        },
        {
          inject: [UserRepositoryFirebase],
          provide: UseCaseProxyModule.EDIT_FCM_TOKEN_USECASE,
          useFactory: (userRepository: UserRepositoryFirebase) =>
            new UseCaseProxy(new EditFCMTokenUsecase(userRepository)),
        },
        {
          inject:[UserRepositoryFirebase],
          provide:UseCaseProxyModule.DELETE_FCM_TOKEN_USECASE,
          useFactory:(userRepository:UserRepositoryFirebase)=> new UseCaseProxy(new DeleteFcmTokenUseCase(userRepository))
        },
        {
          inject:[SubscriptionRepositoryFirebase],
          provide:UseCaseProxyModule.GET_SUBSCRIPTION_USECASE,
          useFactory:(subscriptionRepository:SubscriptionRepositoryFirebase)=> new UseCaseProxy(new GetSubscriptionByOrderIdUseCase(subscriptionRepository))
        },
        {
          inject: [UserRepositoryFirebase,SubscriptionRepositoryFirebase],
          provide: UseCaseProxyModule.POST_SUBSCRIPTION_USECASE,
          useFactory: (userRepository: UserRepositoryFirebase,subscriptionRepository: SubscriptionRepositoryFirebase) =>
            new UseCaseProxy(new PostSubscriptionUseCase(userRepository,subscriptionRepository)),
        },
        {
          inject:[UserRepositoryFirebase,SubscriptionRepositoryFirebase],
          provide:UseCaseProxyModule.HANDLE_EXPIRED_SUBSCRIPTION_USECASE,
          useFactory:(userRepository:UserRepositoryFirebase,subscriptionRepository:SubscriptionRepositoryFirebase)=> new UseCaseProxy(new HandleExpiredSubscriptionUseCase(userRepository,subscriptionRepository))
        },
        {
          inject:[PAYMENT_GATEWAY_TOKEN,SubscriptionRepositoryFirebase],
          provide:UseCaseProxyModule.CREATE_SUBSCRIPTION_PAYMENT_USECASE,
          useFactory:(midtransService: IMidtrans,subscriptionRepository:SubscriptionRepositoryFirebase  )=> new UseCaseProxy(new CreateSubcriptionPaymentUseCase(midtransService,subscriptionRepository))
        },
        {
          inject:[SubscriptionRepositoryFirebase,UserRepositoryFirebase],
          provide:UseCaseProxyModule.MIDTRANS_WEBHOOK_USECASE,
          useFactory:(subscriptionRepository:SubscriptionRepositoryFirebase,userRepository:UserRepositoryFirebase)=> new UseCaseProxy(new MidtransWebHookUseCase(subscriptionRepository,userRepository))
        },
      ],
      exports: [
        //external usecase
        UseCaseProxyModule.SEND_NOTIFICATION_USECASE,
        UseCaseProxyModule.DELETE_FCM_TOKEN_USECASE,
        //internal usecase
        UseCaseProxyModule.REGISTER_USER_USECASE,
        UseCaseProxyModule.LOGIN_USER_USECASE,
        UseCaseProxyModule.CURRENT_USER_USECASE,
        UseCaseProxyModule.GET_USER_BY_ID_USECASE ,
        UseCaseProxyModule.EDIT_USER_USECASE,
        UseCaseProxyModule.UPLOAD_MEDIA_USECASE,
        UseCaseProxyModule.DELETE_STORAGE_MEDIA_USECASE,
        UseCaseProxyModule.POST_MEDIA_USECASE,
        UseCaseProxyModule.DELETE_POST_USECASE,
        UseCaseProxyModule.EDIT_POST_USECASE,
        UseCaseProxyModule.POST_LIKE_USECASE,
        UseCaseProxyModule.GET_POST_LIKE_STATUS_USECASE,
        UseCaseProxyModule.GET_PAGINATED_MEDIA_USECASE,
        UseCaseProxyModule.GET_PAGINATED_USER_MEDIA_USECASE,
        UseCaseProxyModule.GET_PAGINATED_HASHTAG_MEDIA_USECASE,
        UseCaseProxyModule.GET_PAGINATED_FOLLOWING_MEDIA_USECASE,
        UseCaseProxyModule.GET_MEDIA_USECASE,
        UseCaseProxyModule.POST_COMMENT_USECASE,
        UseCaseProxyModule.EDIT_COMMENT_USECASE,
        UseCaseProxyModule.DELETE_COMMENT_USECASE,
        UseCaseProxyModule.COMMENT_LIKE_USECASE,
        UseCaseProxyModule.GET_COMMENT_LIKE_STATUS_USECASE,
        UseCaseProxyModule.POST_REPLY_USECASE,
        UseCaseProxyModule.EDIT_REPLY_USECASE,
        UseCaseProxyModule.DELETE_REPLY_USECASE,
        UseCaseProxyModule.REPLY_LIKE_USECASE,
        UseCaseProxyModule.GET_REPLY_LIKE_STATUS_USECASE,
        UseCaseProxyModule.FOLLOW_USER_USECASE,
        UseCaseProxyModule.UNFOLLOW_USER_USECASE,
        UseCaseProxyModule.GET_USER_FOLLOW_STATUS_USECASE,
        UseCaseProxyModule.GET_USER_FOLLOWING_USECASE,
        UseCaseProxyModule.GET_USER_FOLLOWERS_USECASE,
        UseCaseProxyModule.POST_MESSAGE_USECASE,
        UseCaseProxyModule.GET_MESSAGES_USECASE,
        UseCaseProxyModule.EDIT_FCM_TOKEN_USECASE,
        UseCaseProxyModule.GET_SUBSCRIPTION_USECASE,
        UseCaseProxyModule.POST_SUBSCRIPTION_USECASE,
        UseCaseProxyModule.HANDLE_EXPIRED_SUBSCRIPTION_USECASE,
        UseCaseProxyModule.CREATE_SUBSCRIPTION_PAYMENT_USECASE,
        UseCaseProxyModule.MIDTRANS_WEBHOOK_USECASE,
      ],
    };
  }
}
