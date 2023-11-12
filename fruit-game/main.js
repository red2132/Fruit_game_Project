import { Bodies, Body, Events, Engine, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";

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