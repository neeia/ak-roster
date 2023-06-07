import { Box, Button, Typography } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Operator, OperatorData } from "types/operator";
import operatorJson from "data/operators";
import PopOp from "./PopOp";
import useLocalStorage from "util/useLocalStorage";
import { AccountInfo, OperatorSkillSlot } from "types/doctor";
import OpSelectionButton from "./OpSelectionButton";
import { isObject } from "util";
import Image from "next/image";

interface Props {
  user: User;
}

const SupportSelection = ((props: Props) => {
  const { user } = props;
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});
  const operators = useAppSelector(selectRoster);

  const db = getDatabase();

  const [supps, setSupps] = useState<(OperatorSkillSlot | undefined)[]>(doctor.supports ?? []);
  useEffect(() => {
    if (doctor?.supports && typeof doctor.supports === "object") {
      doctor.supports = Object.values(doctor.supports).map(v => {
        return v;
      })
      setSupps(doctor.supports);
    }
  }, [doctor])

  const [index, setIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const setSupp = (value: string) => {
    const s = [...supps];
    const d = { ...doctor };
    s[index] = { opID: value, opSkill: 0 };
    setSupps(s);
    d.supports = s;
    setDoctor(d);
    set(ref(db, `users/${user.uid}/info/support/${index}`), s[index]);
  };
  const setSkill = (target: number, value: number) => {
    const s = [...supps];
    const d = { ...doctor };
    s[target]!.opSkill = value;
    setSupps(s);
    d.supports = s;
    setDoctor(d);
    set(ref(db, `users/${user.uid}/info/support/${target}/opSkill/`), value);
  };
  const clearSupp = (target: number) => {
    const s = [...supps];
    const d = { ...doctor };
    delete s[target];
    setSupps(s);
    d.supports = supps;
    d.supports[target] = undefined;
    setDoctor(d);
    remove(ref(db, `users/${user.uid}/info/support/${target}`));
  };

  const filter = (op: OperatorData) => operators[op.id]?.owned && !supps.find((v) => !v || v.opID === op.id) && (index ? true : op.rarity < 6);
  const sort = (a: Operator, b: Operator) => b.elite - a.elite || b.level - a.level || b.rarity - a.rarity;

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr 1fr 1fr",
          gridTemplateRows: "auto 1fr 1fr 1fr",
          gap: "0.5rem 1rem",
          "& .inactive": {
            opacity: 0.75,
          },
          "& .active": {
            opacity: 1,
            boxShadow: 0,
            borderBottomWidth: "0.25rem",
            borderBottomColor: "primary.main",
            borderBottomStyle: "solid",
            backgroundColor: "info.light",
          },
        }}
      >
        Support Units
        <Box sx={{ gridColumn: "span 3" }}>
          Skills
        </Box>
        {[...Array(3)].map((_, i) => {
          const op = operators[supps[i]?.opID ?? ""];
          const opInfo = op ? operatorJson[op.id as keyof typeof operatorJson] : undefined;
          return (
            <Box display="contents" key={i}>
              <OpSelectionButton
                op={op}
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
                clear={() => { clearSupp(i) }}
              />
              {(op
                ? [...Array(3)].map((_, k) => {
                  if (k < getNumSkills(op)) {
                    return (opInfo && supps[i]
                      ? <Button
                        className={supps[i]!.opSkill === k ? "active" : ""}
                        key={`op-${i}-sk-${k}`}
                        onClick={() => setSkill(i, k)}
                        disabled={op.elite < k}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "start",
                          gap: 0.5,
                        }}
                      >
                        <Box sx={{
                          display: "flex",
                          alignItems: "center",
                          mt: 0.5,
                          gap: 1,
                        }}>
                          <Box
                            sx={{
                              height: {
                                xs: "2.5rem",
                                sm: "3rem",
                              },
                              width: {
                                xs: "2.5rem",
                                sm: "3rem",
                              },
                              position: "relative",
                            }}
                          >
                            <Image
                              src={`/img/skills/${opInfo.skills[k].iconId ?? opInfo.skills[k].skillId}.png`}
                              layout="fill"
                              alt={`Skill ${k + 1}`}
                            />
                          </Box>
                          <Box sx={{
                            display: {
                              xs: "none",
                              sm: "grid",
                            },
                            width: "36px",
                            height: "35px",
                            position: "relative",
                            minWidth: 0,
                          }}>
                            <Image
                              src={`/img/rank/bg.png`}
                              layout="fill"
                              alt={""}
                            />
                            {(!op.masteries[k] || op.masteries[k] === 0
                              ? <Image
                                src={`/img/rank/${op.rank}.png`}
                                layout="fill"
                                alt={`Level ${op.rank}`}
                              />
                              : <Image
                                src={`/img/rank/m-${op.masteries[k]}.png`}
                                layout="fill"
                                alt={`Mastery Level ${op.masteries[k]}`}
                              />
                            )}
                          </Box>
                        </Box>
                        <Typography
                          variant="caption2"
                          sx={{
                            gridColumn: "span 2",
                            fontWeight: 100,
                            lineHeight: 1,
                            display: {
                              xs: "none",
                              sm: "flex",
                            },
                            alignItems: "center",
                            justifyContent: "center",
                            height: "1.5rem",
                            color: "text.primary"
                          }}
                        >
                          {opInfo.skills[k].skillName}
                        </Typography>
                      </Button>
                      : <div key={`button-op-${i}-err-${k}`}>Error</div>
                    );
                  } else {
                    return <div key={`button-op-${i}-no-sk-${k}`} />
                  }
                })
                : <>
                  <div />
                  <div />
                  <div />
                </>
              )}
            </Box>
          );
        })}
      </Box>
      <PopOp
        operators={operators}
        open={open}
        onClose={() => setOpen(false)}
        title="Set Support"
        onClick={setSupp}
        filter={filter}
        sort={sort}
      />
    </>);
});

export default SupportSelection;