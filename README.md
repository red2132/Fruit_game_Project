# 과일 충돌 게임

## 1. 개발 목표
Nods.js의 패키지인 Matter-js를 이용해 간단한 게임 제작
- keyevent를 이용한 과일 이동
-collision  기능을 이용해, 같은 과일끼리 부딪치면 더 큰 과일로 합쳐지는 
  기능 제작,
- 기준 선을 넘으면, GAME OVER 되는 기능 제작

<img src='https://github.com/red2132/Fruit_game_Project/assets/86100654/e0a1ff8f-2111-4b3a-98c4-384868f7a074'>

## 2. 개발 환경
사용언어: javascript(ES6)
개발환경: node.js(Matter-js), vite

## 3. 개발과정

게임 요소(벽, gameover 감지 센서 등등) 선언
```jsx
const engine = Engine.create()
const render =Render.create({
  engine: engine,
  element: document.body,
  options: {
    wireframes:false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  }
})
// 게임 필드 생성
const world = engine.world

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
})
const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
})
const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
})
const topLine = Bodies.rectangle(310, 650, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" }
})

World.add(world, [leftWall, rightWall, ground, topLine])

Render.run(render);
Runner.run(engine);
```

2. 과일 위치 및 과일 추가, 과일 이동, 과일 결합 함수 선언
```jsx

// 전역변수 초기화
let currentBody = null // 현재 조작중인 과일 속성
let currentFruit = null // 현재 조작중인 과일 정보
let disableAction = false // 과일 움직임 작동 여부(하강 시 움직임 제한)

function addFruit() {
  const fruitIndex = Math.floor(Math.random() * 5) // 과일 랜덤 생성(인덱스 부여)
  const fruit = FRUITS[fruitIndex]
 
  // 개임 내 출현 과일 정보
  const body = Bodies.circle(300, 50, fruit.radius, {
    index: fruitIndex,
    isSleeping: true, // 과일 대기 상태
    render: {
      //sprite: { texture: `${fruit.label}.png`}
      //과일 이미지 렌더링 오류로 인해 주석 처리, 추후 문제 해결시 해제 예정
    },
    restitution: 0.2 // 과일 떨어질 때의 탄성
  })
  currentBody = body
  currentFruit = fruit

  World.add(world, body);
}
//과일 이동
window.onkeydown = (event) => {
  if(disableAction) {
    return
  } 
  switch (event.keyCode) {
    case 37:
      //과일 좌측 이동
      if(currentBody.position.x -currentFruit.radius > 30) {
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 10,
          y: currentBody.position.y
        })
      }
      break
    case 39:
      //과일 우측 이동
      if(currentBody.position.x + currentFruit.radius < 590) {
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 10,
          y: currentBody.position.y
        })
      }
      break
    case 40:
      currentBody.isSleeping = false // 과일 하강
      disableAction = true

      setTimeout(() => {
        addFruit() // 새로운 과일 생성
        disableAction = false
      }, 1000);
      break
  }
}
// 충돌 시 더 큰 과일로 변경
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if(collision.bodyA.index === collision.bodyB.index)
    {
      const newFruitIndex = collision.bodyA.index + 1 // 생성과일 인덱스
      World.remove(world, [collision.bodyA, collision.bodyB]) // 같은 과일일 경우 삭제
      if(newFruitIndex === FRUITS.length -1 ) { // 수박일 경우 새로운 과일 추가X
        return
      }
      // 새로운 과일 정보 생성
      const newFruit = FRUITS[newFruitIndex]

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
          //  sprite: { texture: `${newFruit.label}.png`}
          },
          index: newFruitIndex
        }
      )
      World.add(world, newBody)
    }
    // top 라인에 과일이 닿으면 게임 오버
    if(disableAction &&
      (collision.bodyA.name==="topLine" || collision.bodyB.name==="topLine")) {
      alert("Game Over")
    }
  })
})
addFruit()
```

## 4. 마무리
아쉬웠던 점은 이미지를 불러와 렌더링 하면 게임이 느려지는 버그가 발생해 주석처리할 수 밖에 없었다는 것이다. 하지만 이번 경험을 통해 javascript의 물리 엔진을 다뤄보는 재미난 경험을 할 수 있었으며, bulid툴인 vite의 유용함도 알게되었다.
