import { fetchEventSource } from "@microsoft/fetch-event-source";

type ResultCallBack = (e: any | null) => void;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/ai';
export const postStreamChat = (
    author: string,
    onMessage: ResultCallBack,
    onError: ResultCallBack,
    onClose: ResultCallBack
) => {
  const ctrl = new AbortController();
  fetchEventSource(apiBaseUrl + "/post-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      author: author,
    }),
    signal: ctrl.signal,
    onmessage: onMessage,
    onerror: (err: any) => {
      onError(err);
      ctrl.abort();
      throw err;
    },
    onclose: () => {
      onClose(null);
    },
    onopen: async (response: any) => {
      if (!response.ok) {

      }
    },
  });
};

export const getStreamChat = (
    params: string,
    onMessage: ResultCallBack,
    onError: ResultCallBack,
    onClose: ResultCallBack
) => {
  const ctrl = new AbortController();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/ai';
  // 构建完整URL，附加查询参数
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const fullUrl = `${apiBaseUrl}/chat/chat${queryString}`
  fetchEventSource(fullUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: null,
    signal: ctrl.signal,
    onmessage: onMessage,
    onerror: (err: any) => {
      onError(err);
      ctrl.abort();
      throw err;
    },
    onclose: () => {
      onClose(null);
    },
    onopen: async (response: any) => {
      if (!response.ok) {
      }
    },
  });
};
