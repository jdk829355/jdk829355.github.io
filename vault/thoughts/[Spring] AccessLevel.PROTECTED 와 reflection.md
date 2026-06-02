엔티티 작성 중 이런 코드를 많이 쓴다는 것을 봤다. 

```Java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

이건 그냥 arg를 받지 않는 protected constructor를 생성하는 것이다. 

| 접근제어자                    | 같은 클래스 | 같은 패키지 | 자식 클래스 | 외부  |
| ------------------------ | ------ | ------ | ------ | --- |
| private                  | O      | X      | X      | X   |
| default(package-private) | O      | O      | X      | X   |
| protected                | O      | O      | O      | X   |
| public                   | O      | O      | O      | O   |

그래서 entity 상에서 field가 null인 애들이(불완전한 객체) 생기는 것을 막을 수 있다. 

```Java
new Player();
```

이걸 불가능하게 함

근데 reflection을 쓰는 라이브러리 (Spring, Hibernate, ..) 같은 애들은 protected라도 생성자를 호출할 수 있음

```Java
Constructor<Account> constructor =
    Account.class.getDeclaredConstructor();

constructor.setAccessible(true);

Account account =
    constructor.newInstance();
```

그래서 일반적으로 
NoArg인 protected constructor를 만들고 별도의 생성자와 함께 @Builder를 사용한다. 

```Java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {
    private String name;
    private Long age;
    private String email;

    @Builder
    public User(Long age, String email) {
        this.name = "test_name";
        this.age = age;
        this.email = email;
    }

    @Builder
    public User(String name, Long age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }
}
```

- 여기서 Builder는 클래스에 붙이면 안 됨. 
- builder는 생성자가 있으면 스킵. 없으면 생성함
- 근데 생성자를 NoArg를 만들었는데 이걸 Builder 안에서 쓰려니 없어서 에러 납니다. 

```Java
public User build() {
            /// 일치하는 생성자가 없다.
            return new User(this.name, this.age, this.email); 
        }
```
