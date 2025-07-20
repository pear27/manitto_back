type Member = {
  groupCode: string;
  userId: string;
  manittoId?: string;
};

export function assignManitto(
  members: Member[],
): { groupCode: string; userId: string; manittoId: string }[] {
  if (members.length < 3) {
    throw new Error('매칭하려면 최소 3명 이상의 멤버가 필요합니다.');
  }

  const shuffled = [...members]; // 멤버 배열 복사

  // Fisher-Yates 셔플 (무작위 섞기)
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 매칭 배정
  const result = members.map((member, idx) => {
    // 다음 인덱스 (마지막은 0으로 순환)
    const manittoIdx = (idx + 1) % members.length;
    return {
      ...member,
      manittoId: shuffled[manittoIdx].userId,
    };
  });

  return result;
}
