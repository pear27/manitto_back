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

  let shuffled: Member[] = []; // 멤버 배열 복사
  let isValid = false;

  do {
    shuffled = [...members];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 자기 자신이 마니또로 매칭되지 않도록 검증
    isValid = members.every(
      (member, idx) =>
        member.userId !== shuffled[(idx + 1) % members.length].userId,
    );
  } while (!isValid);

  return shuffled.map((member, idx) => ({
    groupCode: member.groupCode,
    userId: member.userId,
    manittoId: shuffled[(idx + 1) % shuffled.length].userId,
  }));
}
