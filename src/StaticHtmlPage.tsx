import {
  useEffect,
  useRef,
  type CompositionEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import responsiveStyles from './styles/responsive.css?raw';
import sharedStyles from './styles/shared.css?raw';

type StaticHtmlPageProps = {
  markup: string;
  pageStyles: string;
  script: string;
  title: string;
};

function StaticHtmlPage({
  markup,
  pageStyles,
  script,
  title,
}: StaticHtmlPageProps) {
  const isComposing = useRef(false);

  useEffect(() => {
    document.title = title;

    const runPageScript = new Function(script);
    runPageScript();
  }, [script, title]);

  const escapeHtml = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[char] ?? char,
    );

  const sendChatMessage = (input: HTMLInputElement) => {
    const stream = document.getElementById('chatStream');
    if (!stream) return;

    const text = input.value.trim();
    if (!text) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'msg user';
    userMessage.innerHTML = `<div class="who">나</div><div class="bubble">${escapeHtml(text)}</div>`;
    stream.appendChild(userMessage);
    input.value = '';

    const typingId = 'typingMsg';
    document.getElementById(typingId)?.remove();
    const typing = document.createElement('div');
    typing.id = typingId;
    typing.className = 'msg ai';
    typing.innerHTML =
      '<div class="who"><span class="av">AI</span>AI 인터뷰어</div><div class="bubble" style="display:flex;align-items:center;gap:10px;"><span class="typing"><span class="dots"><i></i><i></i><i></i></span>입력 중…</span></div>';
    stream.appendChild(typing);
    const chatCard = stream.closest('.chat');
    chatCard?.classList.remove('ai-thinking-leaving');
    chatCard?.classList.add('ai-thinking');
    stream.scrollTop = stream.scrollHeight;

    const replies = [
      '멋진 답변이에요. <b>경쟁력 섹션</b>에 반영해둘게요.',
      '좋아요. 자금은 주로 <b>인력 · R&amp;D · 장비 · 마케팅</b> 중 어디에 쓰실 예정인가요?',
      '우측 <span class="hl">"AI가 이해한 우리 회사"</span> 카드도 업데이트하고 있어요.',
      '<b>3년 매출 추이</b>도 공유 가능하실까요? 추천 적합도에 중요해요.',
    ];
    const replyIndex = Number(stream.dataset.replyIndex ?? '0');
    stream.dataset.replyIndex = String(replyIndex + 1);

    window.setTimeout(() => {
      typing.remove();
      const chatCard = stream.closest('.chat');
      chatCard?.classList.remove('ai-thinking');
      chatCard?.classList.add('ai-thinking-leaving');
      const aiMessage = document.createElement('div');
      aiMessage.className = 'msg ai';
      aiMessage.innerHTML = `<div class="who"><span class="av">AI</span>AI 인터뷰어</div><div class="bubble">${replies[replyIndex % replies.length]}</div>`;
      stream.appendChild(aiMessage);
      stream.scrollTop = stream.scrollHeight;
      window.setTimeout(() => {
        chatCard?.classList.remove('ai-thinking-leaving');
      }, 650);
    }, 3000);
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const sendButton = target.closest('#sendBtn');
    if (sendButton) {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();

      const input = document.getElementById('chatInput');
      if (!(input instanceof HTMLInputElement)) return;

      if (isComposing.current) {
        window.setTimeout(() => sendChatMessage(input), 0);
        return;
      }

      sendChatMessage(input);
      return;
    }

    const fabButton = target.closest('#fabBtn');
    const fabBackdrop = target.closest('#fabBackdrop');
    if (!fabButton && !fabBackdrop) return;

    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    const popover = document.getElementById('fabPop');
    const backdrop = document.getElementById('fabBackdrop');
    const button = document.getElementById('fabBtn');
    if (!popover || !backdrop || !button) return;

    const shouldOpen = Boolean(fabButton) && !popover.classList.contains('open');
    popover.classList.toggle('open', shouldOpen);
    backdrop.classList.toggle('open', shouldOpen);
    button.setAttribute('aria-expanded', String(shouldOpen));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const input = target.closest('#chatInput');
    if (!(input instanceof HTMLInputElement)) return;
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    if (
      isComposing.current ||
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === 229
    ) {
      return;
    }

    event.preventDefault();
    sendChatMessage(input);
  };

  const handleCompositionStart = (event: CompositionEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('#chatInput')) isComposing.current = true;
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('#chatInput')) isComposing.current = false;
  };

  return (
    <>
      <style>{sharedStyles}</style>
      <style>{pageStyles}</style>
      <style>{responsiveStyles}</style>
      <div
        onClickCapture={handleClick}
        onKeyDownCapture={handleKeyDown}
        onCompositionStartCapture={handleCompositionStart}
        onCompositionEndCapture={handleCompositionEnd}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  );
}

export default StaticHtmlPage;
