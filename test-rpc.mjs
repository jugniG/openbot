async function main() {
  console.log("Calling oRPC startEngineeringSession on localhost:3000...");
  const res = await fetch("http://localhost:3000/api/rpc/engineer/startEngineeringSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      goal: "Build an agent that audits quarterly expense CSVs, isolates duplicate billings, and outputs findings."
    }),
  });

  console.log("HTTP Status:", res.status);
  const json = await res.json();
  console.log("Session ID:", json.session?.id);
  console.log("Agent:", json.session?.currentAgent?.name);
  console.log("Iterations:", json.session?.iterations?.length);
  console.log("v0 Score:", json.session?.iterations?.[0]?.evaluationRun?.overallScore + "%");
  console.log("v1 Score:", json.session?.iterations?.[1]?.evaluationRun?.overallScore + "%");
  console.log("Verified Passed:", json.session?.iterations?.[1]?.evaluationRun?.passed);
}

main();
