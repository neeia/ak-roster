import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { Operator, OperatorData } from "types/operator";
import operatorJson from "data/operators";
import PopOp from "./PopOp";
import OpSelectionButton from "./OpSelectionButton";
import Image from "next/image";
import { useRosterGetQuery } from "store/extendRoster";
import {
  useSupportRemoveMutation,
  useSupportSetMutation,
  useSupportsGetQuery,
  useSupportSkillSetMutation,
} from "store/extendSupports";
import { OperatorSupport } from "types/operators/supports";

const SupportSelection = () => {
  const { data: operators, isLoading: isLoadingOperators } =
    useRosterGetQuery();
  const { data: supports, isLoading: isLoadingSupport } = useSupportsGetQuery();

  const [setSupport] = useSupportSetMutation();
  const [setSupportSkill] = useSupportSkillSetMutation();
  const [removeSupport] = useSupportRemoveMutation();

  const [index, setIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const setSupp = (value: string) => {
    //TODO module selection not implemented yet
    //const opInfo = operatorJson[value as keyof typeof operatorJson];
    const support: OperatorSupport = {
      module: {},
      op_id: value,
      skill: 0,
      slot: index,
    };
    setSupport(support);
  };
  const setSkill = (supportSlot: number, skillSlot: number) => {
    setSupportSkill({ supportSlot, skillSlot });
  };
  const clearSupp = (supportSlot: number) => {
    removeSupport(supportSlot);
  };

  const filter = (op: OperatorData) =>
    operators![op.id] != null &&
    !supports!.find((v) => !v || v.op_id === op.id) &&
    (index ? true : op.rarity < 6);
  const sort = (a: Operator, b: Operator) =>
    b.elite - a.elite || b.level - a.level;

  return isLoadingOperators || isLoadingSupport ? null : (
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
        <Box sx={{ gridColumn: "span 3" }}>Skills</Box>
        {[...Array(3)].map((_, i) => {
          const support = supports!.filter((support) => support.slot === i)[0];
          const op = operators![support?.op_id ?? ""];
          const opInfo = op
            ? operatorJson[op.op_id as keyof typeof operatorJson]
            : undefined;
          return (
            <Box display="contents" key={i}>
              <OpSelectionButton
                op={op}
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
                clear={() => {
                  clearSupp(i);
                }}
              />
              {op ? (
                [...Array(3)].map((_, k) => {
                  if (k < (opInfo?.skillData?.length ?? 0)) {
                    return opInfo && support ? (
                      <Button
                        className={support.skill === k ? "active" : ""}
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
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 0.5,
                            gap: 1,
                          }}
                        >
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
                              src={`/img/skills/${
                                opInfo.skillData?.[k].iconId ??
                                opInfo.skillData?.[k].skillId
                              }.png`}
                              fill
                              alt={`Skill ${k + 1}`}
                            />
                          </Box>
                          <Box
                            sx={{
                              display: {
                                xs: "none",
                                sm: "grid",
                              },
                              width: "36px",
                              height: "35px",
                              position: "relative",
                              minWidth: 0,
                            }}
                          >
                            <Image src={`/img/rank/bg.png`} fill alt={""} />
                            {!op.masteries[k] || op.masteries[k] === 0 ? (
                              <Image
                                src={`/img/rank/${op.skill_level}.png`}
                                fill
                                alt={`Level ${op.skill_level}`}
                              />
                            ) : (
                              <Image
                                src={`/img/rank/m-${op.masteries[k]}.png`}
                                fill
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
                            color: "text.primary",
                          }}
                        >
                          {opInfo.skillData![k].skillName}
                        </Typography>
                      </Button>
                    ) : (
                      <div key={`button-op-${i}-err-${k}`}>Error</div>
                    );
                  } else {
                    return <div key={`button-op-${i}-no-sk-${k}`} />;
                  }
                })
              ) : (
                <>
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
        operators={operators!}
        open={open}
        onClose={() => setOpen(false)}
        title="Set Support"
        onClick={setSupp}
        filter={filter}
        sort={sort}
      />
    </>
  );
};

export default SupportSelection;
