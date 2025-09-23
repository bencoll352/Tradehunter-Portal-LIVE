 
"use server";

export async function getObjectionResponseAction(params: {
  history: any[];
  userMessage: string;
}) {
  console.log(params);
  return { response: "This feature is not yet implemented." };
}
