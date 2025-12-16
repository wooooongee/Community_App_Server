## 아바타 커뮤니티앱 만들기

> Inflearn, Kyo

> [!CAUTION]
> 모든 파일은 개인연습 용도 외에 사용하시면 안됩니다. 저작권에 유의해주세요.

## 실행

1. 의존성 모듈 설치

프로젝트 위치에서 명령어를 실행합니다.

```
npm install
```

2. 환경 변수 설정

`[YOUR_USERNAME]` 부분 추가하여 `.env` 파일을 server 폴더 루트에 추가해주세요.

```
PORT=3030
DB_USERNAME=[postgres 또는 YOUR_USERNAME]
DB_PASSWORD=postgres
DB_DATABASE=community-db
DB_HOST=localhost
JWT_SECRET=SecretCommunity
JWT_ACCESS_TOKEN_EXPIRATION=30m
```

3. 개발 환경 실행

```
npm run start:dev
```

<br>

## API

- 각 response 타입은 강의코드의 types와 같습니다.

#### POST /auth/signup

- requestBody

```
{
    email: string
    password: string
}
```

#### POST /auth/signin

- requestBody

```js
{
  email: string;
  password: string;
}
```

- response

```js
{
  accessToken: string;
}
```

#### GET /auth/me

- response

```ts
Profile;
```

#### PATCH /auth/me (editProfile)

- requestBody

```ts
Profile;
```

- response

```ts
Profile;
```

#### GET /auth/:id (getUserProfile)

- response

```ts
Profile;
```

#### GET /avatar/:item

- response

```ts
string[]
```

#### POST /comments

- requestBody

```ts
{
  content: string;
  postId: number;
  parentCommentId?: number;
}
```

#### DELETE /comments/:id

#### POST /images

- requestBody

```ts
FormData;
```

#### POST /posts

- requestBody

```ts
{
  title: string;
  description: string;
  imageUris: ImageUri[];
  voteTitle?: string;
  voteOptions?: VoteOption[];
}
```

#### GET /posts?page=${page} (getPosts)

- response

```ts
Post[]
```

#### GET /posts?my?page=${page} (getMyPosts)

- response

```ts
Post[]
```

#### GET /posts/user/${id}?page=${page} (getUserPosts)

- response

```ts
Post[]
```

#### GET /likes?page=${page} (getLikedPosts)

- response

```ts
Post[]
```

#### GET /posts/search?query=${query}&page=${page} (getSearchPosts)

- response

```ts
Post[]
```

#### GET /posts/:id

- response

```ts
Post;
```

#### DELETE /posts/:id

#### PATCH /posts/:id

- requestBody

```ts
{
  title: string;
  description: string;
  imageUris: ImageUri[];
  voteTitle?: string;
  voteOptions?: VoteOption[];
}
```

- response

```ts
{
  postId: number;
}
```

#### POST /posts/:postId/vote/:voteOptionId

- requestBody

```ts
{
  postId: number;
  voteOptionId: number;
}
```

- response

```ts
{
  postId: number;
  voteOption: VoteOption;
}
```

#### POST /likes/:id

- response

```ts
{
  postId: number;
}
```
