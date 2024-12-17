import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { Fragment, useState } from "react";
import { OperatorData } from "types/operators/operator";
import operatorJson from "data/operators";
import OpSelectionButton from "./OpSelectionButton";
import Image from "next/image";
import { OperatorSupport } from "types/operators/supports";
import useOperators from "util/hooks/useOperators";
import useSupports from "util/hooks/useSupports";
import OperatorSearch from "components/planner/OperatorSearch";
import SupportOption from "./SupportOption";

const SupportSelection = () => {
  const [operators] = useOperators();
  const [supports, _setSupport] = useSupports();
  const [index, setIndex] = useState<number>(0);
  const [input, setInput] = useState<string>(supports[index]?.op_id);

  const [open, setOpen] = useState<boolean>(false);

  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const setSupport = (value: string) => {
    const support: OperatorSupport = {
      module: null,
      op_id: value,
      skill: 0,
      slot: index,
    };
    _setSupport(support);
  };
  const setSkill = (supportSlot: number, skillSlot: number) => {
    const support = supports.find(({ slot }) => slot === supportSlot);
    if (!support) return;
    support.skill = skillSlot;
    _setSupport(support);
  };
  const setModule = (supportSlot: number, moduleSlot: number) => {
    const support = supports.find(({ slot }) => slot === supportSlot);
    if (!support) return;
    const moduleData = operatorJson[support.op_id].moduleData;
    if (!moduleData) return;
    support.module = moduleData[moduleSlot].moduleId;
    _setSupport(support);
  };

  const filter = (op: OperatorData) =>
    operators![op.id] != null && !supports!.find((v) => !v || v.op_id === op.id) && (index ? true : op.rarity < 6);

  return !operators || !supports ? null : (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr 1fr",
          gridTemplateRows: "auto 1fr 1fr 1fr",
          gap: "8px 24px",
          mr: "8px",
          alignItems: "center",
        }}
      >
        <Box>Support Units</Box>
        <Box>Skills</Box>
        <Box>Modules</Box>
        {[...Array(3)].map((_, i) => {
          const support = supports.filter((support) => support.slot === i)[0];
          const op = support ? { ...operators[support?.op_id], ...operatorJson[support?.op_id] } : undefined;
          return (
            <Fragment key={i}>
              <OpSelectionButton
                op={op}
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
              />
              {op ? (
                <>
                  {/* Skills */}
                  {!op.skillData ? (
                    <Box></Box>
                  ) : (
                    <SupportOption value={support.skill} onChange={(j) => setSkill(i, j)} mobile={fullScreen}>
                      {op.skillData.map((_, j) => (
                        <Box
                          key={j}
                          sx={{
                            position: "relative",
                            width: 48,
                            height: 48,
                          }}
                        >
                          <Image
                            src={`/img/skills/${op.skillData?.[j].iconId ?? op.skillData?.[j].skillId}.png`}
                            width={48}
                            height={48}
                            alt={`Skill ${j + 1}`}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              right: -4,
                              bottom: -4,
                              width: 24,
                              height: 24,
                            }}
                          >
                            <Image src={`/img/rank/bg.png`} fill alt={""} />
                            {!op.masteries[j] || op.masteries[j] === 0 ? (
                              <Image src={`/img/rank/${op.skill_level}.png`} fill alt={`Level ${op.skill_level}`} />
                            ) : (
                              <Image
                                src={`/img/rank/m-${op.masteries[j]}.png`}
                                fill
                                alt={`Mastery Level ${op.masteries[j]}`}
                              />
                            )}
                          </Box>
                        </Box>
                      ))}
                    </SupportOption>
                  )}
                  {/* Modules */}
                  {!op.moduleData ? (
                    <Box></Box>
                  ) : (
                    <SupportOption
                      value={op.moduleData.findIndex(({ moduleId }) => moduleId === support.module) ?? null}
                      onChange={(j) => setModule(i, j)}
                      mobile={fullScreen}
                      disable={op.moduleData.reduce(
                        (acc, cur, i) => (op.modules[cur.moduleId] > 0 ? acc : [...acc, i]),
                        [] as number[]
                      )}
                    >
                      {op.moduleData.map((mod, j) => {
                        const stage = op.modules[mod.moduleId];
                        return (
                          <Box
                            key={j}
                            sx={{
                              position: "relative",
                              width: 48,
                              height: 48,
                            }}
                          >
                            <Image
                              src={`/img/equip/${mod.moduleId}.png`}
                              width={48}
                              height={48}
                              alt={`Module ${j + 1}`}
                            />
                            {stage > 0 && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  right: -4,
                                  bottom: -4,
                                  width: 24,
                                  height: 24,
                                }}
                              >
                                <Image src={`/img/rank/bg.png`} fill alt={""} />
                                <Image src={`/img/equip/img_stg${stage}.png`} fill alt={`Stage ${stage}`} />
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </SupportOption>
                  )}
                </>
              ) : (
                <>
                  <div />
                  <div />
                </>
              )}
            </Fragment>
          );
        })}
      </Box>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setInput(supports[index]?.op_id);
        }}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Support</DialogTitle>
        <DialogContent>
          <OperatorSearch
            sx={{ mt: 1 }}
            value={operatorJson[input]}
            onChange={(op: OperatorData | null) => (op ? setInput(op.id) : null)}
            filter={filter}
          />
        </DialogContent>
        <DialogActions sx={{ display: "flex", gap: 1, width: "100%" }}>
          <Button
            variant="neutral"
            onClick={() => {
              setOpen(false);
              setInput(supports[index]?.op_id);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => {
              if (input in operatorJson) {
                setSupport(input);
                setOpen(false);
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SupportSelection;
