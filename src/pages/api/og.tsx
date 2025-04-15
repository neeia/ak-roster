import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { ImageResponse } from "@vercel/og";
import operatorJson from "data/operators";
import { NextRequest } from "next/server";
import { rarityColors } from "styles/rarityColors";
import { ModuleData, Operator } from "types/operators/operator";
import { Database } from "types/supabase";
import { MAX_LEVEL_BY_RARITY } from "util/changeOperator";
import getAvatar from "util/fns/getAvatar";
import getAvatarFull from "util/fns/getAvatarFull";
import imageBase from "util/imageBase";

function getModUrl(mod: ModuleData) {
  return `${imageBase}/equip/${mod.typeName.toLowerCase()}.png`;
}

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const username = searchParams.get("username");
  if (!username) {
    return new ImageResponse(<>No User Found</>, {
      width: 1200,
      height: 630,
    });
  }

  const supabase = createBrowserSupabaseClient<Database>();

  const { data: account, error: accountError } = await supabase
    .from("krooster_accounts")
    .select("display_name, assistant, supports (op_id, slot), operators (*)")
    .eq("username", username.toLocaleLowerCase())
    .limit(1)
    .single();

  if (accountError || !account) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            color: "#fafafa",
            background: "#212121",
            width: "100%",
            height: "100%",
            paddingLeft: "64px",
            paddingTop: "128px",
            position: "relative",
            lineHeight: 1,
          }}
        >
          <div style={{ fontSize: 48 }}>Krooster | Import</div>
          <div style={{ fontSize: 64 }}>Oops! This user does not exist.</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  let assistant: Operator | null = null;
  let supports: Operator[] = [];
  const ownedRarities = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < account.operators.length; i++) {
    const op = account.operators[i] as Operator;
    if (op.op_id === account.assistant) {
      assistant = op;
    }
    const supp = account.supports.find((s) => s.op_id === op.op_id);
    if (supp) supports[supp.slot] = op;
    const rarity = operatorJson[op.op_id].rarity;
    ownedRarities[rarity - 1]++;
  }

  const len = Object.keys(operatorJson).length;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 24,
          color: "#fafafa",
          background: "#212121",
          width: "100%",
          height: "100%",
          paddingLeft: "64px",
          position: "relative",
          lineHeight: 1,
          fontFamily: `"Lato", sans-serif`,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "600px",
            height: "600px",
            justifyContent: "center",
            alignItems: "flex-start",
            color: "black",
          }}
        >
          <img
            width="720"
            height="720"
            src={
              assistant
                ? getAvatarFull({
                    ...assistant,
                    ...operatorJson[assistant.op_id],
                  }).replace(".webp", ".png")
                : `${imageBase}/characters/logo_rhodes.png`
            }
            style={{
              objectFit: "contain",
              marginTop: "-32px",
            }}
          />
        </div>
        <span
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            margin: 1,
            fontSize: 24,
            padding: "4px 8px",
            backgroundColor: "#ffd440",
            borderRadius: "4px",
            color: "black",
          }}
        >
          /u/{username}
        </span>
        <span
          style={{
            fontSize: 64,
            position: "absolute",
            bottom: 24,
            left: 8,
            margin: 1,
            backgroundColor: "#121212cc",
            borderRadius: 4,
            minHeight: "72px",
            maxWidth: "720px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            color: "#fafafa",
          }}
        >
          {account.display_name}
        </span>
        {account.supports.length > 0 && (
          <div
            style={{
              display: "flex",
              height: "100%",
              alignSelf: "flex-end",
              gap: "32px",
              padding: "0 32px",
              alignItems: "center",
              justifyContent: "flex-end",
              backgroundColor: "#21212166",
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                justifyContent: "center",
                filter: "drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.75))",
              }}
            >
              {supports
                .filter((s) => !!s)
                .map((op) => {
                  const opData = operatorJson[op.op_id];
                  return (
                    <div
                      key={op.op_id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#121212",
                        padding: "8px 6px 4px 6px",
                        margin: "2px 4px 4px 10px",
                        borderRadius: "4px",
                        gap: "4px",
                      }}
                    >
                      {/* Name */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          height: "28px",
                          marginLeft: "4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 24,
                          }}
                        >
                          {opData.name}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "16px", position: "relative" }}>
                        {/* Avatar */}
                        <img
                          src={getAvatar({ ...op, ...opData }).replace(".webp", ".png")}
                          width="120"
                          height="120"
                          style={{
                            boxSizing: "content-box",
                            borderBottom: `4px solid ${rarityColors[opData.rarity]}`,
                          }}
                        />
                        {op.potential > 1 && (
                          <img
                            style={{
                              width: "32px",
                              height: "32px",
                              position: "absolute",
                              left: 0,
                              bottom: 4,
                              backgroundColor: "#121212aa",
                              border: "1px solid #212121aa",
                              display: "flex",
                            }}
                            src={`${imageBase}/potential/${op.potential}.png`}
                            width="32"
                            height="32"
                          />
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          <img
                            style={{
                              marginBottom: 0,
                            }}
                            src={`${imageBase}/elite/${op.elite}_s_box.png`}
                            width="48"
                            height="48"
                          />
                          <div
                            style={{
                              height: 48,
                              width: 48,
                              fontSize: 32,
                              lineHeight: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              backgroundColor: "#121212",
                              border: "3px solid",
                              borderColor: op.level === MAX_LEVEL_BY_RARITY[opData.rarity][2] ? "#ffe58d" : "#707070",
                            }}
                          >
                            {op.level}
                          </div>
                        </div>
                        {/* Skills & Modules */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          {/* Skills */}
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                            }}
                          >
                            {[...Array(3)].map((_, i: number) => {
                              if (!opData.skillData?.[i])
                                return (
                                  <div
                                    key={i}
                                    style={{
                                      width: 48,
                                      height: 48,
                                      backgroundColor: "#212121",
                                      border: "1px solid #303030",
                                      opacity: 0.5,
                                      display: "flex",
                                    }}
                                  >
                                    <svg>
                                      <line x1="0" y1="0" x2="24" y2="24" stroke="grey" strokeWidth="1" />
                                    </svg>
                                  </div>
                                );
                              return (
                                <div
                                  key={i}
                                  style={{
                                    opacity: op.elite >= i ? 1 : 0.25,
                                    width: 48,
                                    height: 48,
                                    position: "relative",
                                    backgroundImage: `url('${imageBase}/rank/bg.png')`,
                                    backgroundSize: "100% 100%",
                                    display: "flex",
                                  }}
                                >
                                  {!op.masteries[i] ? (
                                    <img src={`${imageBase}/rank/${op.skill_level}.png`} width="48" height="48" />
                                  ) : (
                                    <img src={`${imageBase}/rank/m-${op.masteries[i]}.png`} width="48" height="48" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {/* Modules */}
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                            }}
                          >
                            {[...Array(3)].map((_, i) => {
                              if (!opData.moduleData?.[i])
                                return (
                                  <div
                                    key={i}
                                    style={{
                                      width: 48,
                                      height: 48,
                                      backgroundColor: "#212121",
                                      border: "1px solid #303030",
                                      opacity: 0.5,
                                    }}
                                  />
                                );
                              const mod = opData.moduleData[i];
                              const modLevel = op.modules[mod.moduleId];
                              return (
                                <div
                                  key={mod.moduleId}
                                  style={{
                                    display: "flex",
                                    position: "relative",
                                    height: 48,
                                    width: 48,
                                    backgroundImage: `url('${imageBase}/rank/bg.png')`,
                                    backgroundSize: "100% 100%",
                                    border: "1px solid #303030",
                                    opacity: modLevel ? 1 : 0.25,
                                  }}
                                >
                                  <img src={getModUrl(mod)} width="48" height="48" />
                                  <div
                                    style={{
                                      display: "flex",
                                      fontSize: 24,
                                      position: "absolute",
                                      lineHeight: 1,
                                      textDecoration: "none",
                                      backgroundColor: "grey.950",
                                      paddingLeft: "2px",
                                      right: -1,
                                      bottom: -1,
                                    }}
                                  >
                                    {mod.typeName.slice(-1)}
                                    {modLevel > 1 && modLevel}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            width: "1200px",
            height: "16px",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            backgroundColor: "#666666",
            borderTop: "2px solid #303030",
          }}
        >
          {ownedRarities.map((count, index) => (
            <div
              key={index}
              style={{ height: "100%", width: `${(count / len) * 1200}px`, backgroundColor: rarityColors[index + 1] }}
            />
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
