# Readme-Server

### 우리들의 독서 기록 서비스, ReadMe

![Readme_Poster](https://hyositive.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F8fef7675-7e20-45cf-b799-261a720c9f9c%2Freadme_poster.png?table=block&id=0ff82538-4d41-4e83-9a71-9e4bb2d80272&spaceId=f98cfd80-f6e5-42e4-a0a5-36dd0972ab15&width=2000&userId=&cache=v2)

> 타인의 마음을 울린 문장과 느낀 점을 읽고,
> 기록을 통해 나를 읽는 서비스

> SOPT 30th SOPT-Term </b>
>
> 프로젝트 기간: 2022.03.21 ~ 2022.05.15

### 🛠 Development Environment

![Typescript](https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Nest](https://img.shields.io/badge/Nest-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

### 🧑‍💻 Developers

|                                             김은지                                              |                                               심정욱                                               |                                               김영권                                               |                                               주효식                                               |
| :---------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/u/70746467?v=4" width="200px" height="200px" /> | <img src ="https://avatars.githubusercontent.com/u/44252639?v=4" width = "200px" height="200px" /> | <img src ="https://avatars.githubusercontent.com/u/39653584?v=4" width = "200px" height="200px" /> | <img src ="https://avatars.githubusercontent.com/u/21357387?v=4" width = "200px" height="200px" /> |
|                            [eunji8784](https://github.com/eunji8784)                            |                             [junguksim](https://github.com/junguksim)                              |                           [youngkwon02](https://github.com/youngkwon02)                            |                             [HYOSITIVE](https://github.com/HYOSITIVE)                              |

### How to migrate

1. `npm run typeorm:migration:create -n <Migration name>` 명령어를 통해서 migration 파일을 생성한다. 이름은 `CreateFoodTable` 같이, 해당 Migration 을 통해 이루고자 하는 목적을 토대로 짓는다.
2. 그럼 root directory 에 `1657358615321-CreateFoodTable.ts` 같이 `<타임스탬프>-<MigrationName>` 형태의 파일이 생긴다.
3. Migration 파일의 up 함수에 `await queryRunner.메서드` 를 통해 다양한 DB 작업을 실행할 수 있다.
   1. 예를 들어, CreateFoodTable 의 경우는
   ```typescript
   await queryRunner.query(`CREATE TABLE Food ~~~~`);
   ```
4. down 함수는 revert 가 필요할 때 실행된다. up 함수에서 했던 것을 지워주는 형태로 하면 작성하면 된다.
   1. 예를 들어, CreateFoodTable 의 경우는
   ```typescript
   await queryRunner.query(`DROP TABLE Food`);
   ```
5. up 함수를 실행하려면, `npm run typeorm:migration:up`
6. down 함수를 실행하려면, `npm run typeorm:migration:down`
